import json
import logging
import os
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME        = os.environ["TABLE_NAME"]
DYNAMODB_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT")


def _table():
    kwargs = {"endpoint_url": DYNAMODB_ENDPOINT} if DYNAMODB_ENDPOINT else {}
    return boto3.resource("dynamodb", **kwargs).Table(TABLE_NAME)


def _broadcast_all(domain_name, stage, table, payload):
    """Push payload to every remaining connection (best-effort)."""
    apigw = boto3.client(
        "apigatewaymanagementapi",
        endpoint_url=f"https://{domain_name}/{stage}",
    )
    data = json.dumps(payload).encode("utf-8")

    scan_kwargs = {"ProjectionExpression": "connectionId"}
    while True:
        resp = table.scan(**scan_kwargs)
        for conn in resp.get("Items", []):
            cid = conn["connectionId"]
            try:
                apigw.post_to_connection(ConnectionId=cid, Data=data)
            except apigw.exceptions.GoneException:
                try:
                    table.delete_item(Key={"connectionId": cid})
                except ClientError as e:
                    logger.warning("Cleanup stale %s failed: %s", cid, e)
            except Exception as e:
                logger.error("PostToConnection %s failed: %s", cid, e)
        if "LastEvaluatedKey" not in resp:
            break
        scan_kwargs["ExclusiveStartKey"] = resp["LastEvaluatedKey"]


def handler(event, _context):
    ctx           = event.get("requestContext", {})
    connection_id = ctx.get("connectionId")
    domain_name   = ctx.get("domainName", "")
    stage         = ctx.get("stage", "")

    try:
        table = _table()

        # Get callsign before deletion (for broadcast message)
        resp     = table.get_item(Key={"connectionId": connection_id})
        callsign = resp.get("Item", {}).get("callsign", "unknown")
        now      = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        table.delete_item(Key={"connectionId": connection_id})
        logger.info("Disconnected: %s (%s)", connection_id, callsign)

        # Broadcast user_left to all remaining connections
        if domain_name and domain_name != "localhost":
            payload = {
                "type":      "system",
                "event":     "user_left",
                "callsign":  callsign,
                "timestamp": now,
            }
            try:
                _broadcast_all(domain_name, stage, table, payload=payload)
            except Exception as e:
                logger.error("Broadcast user_left failed: %s", e)

        return {"statusCode": 200, "body": "Disconnected"}

    except ClientError as e:
        logger.error("DynamoDB error on delete: %s", e)
        return {"statusCode": 500, "body": "Internal server error"}
    except Exception as e:
        logger.error("Unexpected error: %s", e)
        return {"statusCode": 500, "body": "Internal server error"}
