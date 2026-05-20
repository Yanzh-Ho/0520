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


def handler(event, _context):
    ctx           = event.get("requestContext", {})
    connection_id = ctx.get("connectionId")
    domain_name   = ctx.get("domainName", "")
    stage         = ctx.get("stage", "")

    # --- Parse and validate body ---
    try:
        body = json.loads(event.get("body") or "")
    except (json.JSONDecodeError, TypeError):
        return {"statusCode": 400, "body": "Invalid JSON body"}

    text = body.get("text", "")
    if not isinstance(text, str) or not text.strip():
        return {"statusCode": 400, "body": "Missing or invalid text"}
    if len(text) > 1000:
        return {"statusCode": 400, "body": "Missing or invalid text"}

    try:
        table = _table()

        # --- Resolve sender callsign from DynamoDB (anti-spoofing) ---
        resp   = table.get_item(Key={"connectionId": connection_id})
        sender = resp.get("Item")
        if not sender:
            return {"statusCode": 400, "body": "Unknown sender"}
        callsign = sender["callsign"]

        # --- Build broadcast payload ---
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        payload = {
            "type":      "message",
            "callsign":  callsign,
            "text":      text,
            "timestamp": now,
        }
        data = json.dumps(payload).encode("utf-8")

        # --- Scan all connections with pagination ---
        connections  = []
        scan_kwargs  = {"ProjectionExpression": "connectionId"}
        while True:
            scan_resp = table.scan(**scan_kwargs)
            connections.extend(scan_resp.get("Items", []))
            if "LastEvaluatedKey" not in scan_resp:
                break
            scan_kwargs["ExclusiveStartKey"] = scan_resp["LastEvaluatedKey"]

        # --- Fan-out via PostToConnection ---
        apigw = boto3.client(
            "apigatewaymanagementapi",
            endpoint_url=f"https://{domain_name}/{stage}",
        )
        for conn in connections:
            cid = conn["connectionId"]
            try:
                apigw.post_to_connection(ConnectionId=cid, Data=data)
            except apigw.exceptions.GoneException:
                try:
                    table.delete_item(Key={"connectionId": cid})
                    logger.info("Removed stale connection %s", cid)
                except ClientError as e:
                    logger.warning("Cleanup stale %s failed: %s", cid, e)
            except Exception as e:
                logger.error("PostToConnection %s failed: %s", cid, e)

        return {"statusCode": 200, "body": "Message sent"}

    except ClientError as e:
        logger.error("DynamoDB error: %s", e)
        return {"statusCode": 500, "body": "Internal server error"}
    except Exception as e:
        logger.error("Unexpected error: %s", e)
        return {"statusCode": 500, "body": "Internal server error"}
