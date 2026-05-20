# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Anonymous WebSocket Chat** — serverless, single-channel, anonymous real-time chat. No authentication; users pick a callsign when joining. All messages are ephemeral (no persistence). GitHub repo: `git@github.com:samsonchen/ai_course_2.git`.

## Repository Structure

```
ai_course_2/
├── webui/                   # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/      # JoinScreen, ChatScreen, MessageList, MessageItem, MessageInput, StatusIndicator
│       ├── hooks/           # useWebSocket.ts
│       ├── types/           # TypeScript interfaces
│       └── config.ts        # VITE_WS_ENDPOINT from env
├── lambda/
│   ├── connect/             # chat-connect: $connect route
│   ├── disconnect/          # chat-disconnect: $disconnect route
│   └── send_message/        # chat-send-message: sendMessage route
├── template.yaml            # AWS SAM template
└── documents/               # Design specs (source of truth for intended behavior)
```

## Commands

### Frontend (webui/)

```bash
npm install          # install deps
npm run dev          # dev server at http://localhost:5173
npm run build        # production build → webui/dist/
```

Local dev requires `webui/.env.local`:
```
VITE_WS_ENDPOINT=wss://{api-id}.execute-api.{region}.amazonaws.com/prod
```

`vite.config.ts` must set `base: '/ai_course_2/'` for GitHub Pages.

### Backend (AWS SAM)

```bash
sam validate --template template.yaml   # lint SAM template
sam build                               # build all Lambdas
sam deploy --no-confirm-changeset       # deploy (requires prior guided deploy)
sam deploy --guided                     # first-time interactive deploy (human must run)

# Invoke a single Lambda locally against a test event
sam local invoke ConnectFunction -e events/connect_valid.json
sam local invoke DisconnectFunction -e events/disconnect_valid.json
sam local invoke SendMessageFunction -e events/send_valid.json

# View logs
sam logs -n ConnectFunction --stack-name anonymous-chat --tail
sam logs -n SendMessageFunction --stack-name anonymous-chat --tail

# Post-deploy verification
aws cloudformation describe-stacks --stack-name anonymous-chat \
  --query "Stacks[0].StackStatus" --output text
aws dynamodb scan --table-name ChatConnections

# Teardown
sam delete --stack-name anonymous-chat --no-prompts
```

### DynamoDB Local (for local Lambda testing)

```bash
docker run -p 8000:8000 amazon/dynamodb-local

aws dynamodb create-table \
  --table-name ChatConnections \
  --attribute-definitions AttributeName=connectionId,AttributeType=S \
  --key-schema AttributeName=connectionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```

Set `DYNAMODB_ENDPOINT=http://host.docker.internal:8000` in Lambda env to use local DynamoDB.

## Architecture

### Data Flow

- **Connect**: Client opens WebSocket with `?callsign=X` → `$connect` Lambda validates callsign (`^[a-zA-Z0-9_]{1,20}$`) → writes `{connectionId, callsign, connectedAt}` to DynamoDB → broadcasts `user_joined` system event.
- **Send message**: Client sends `{"action":"sendMessage","text":"..."}` → Lambda reads sender callsign from DynamoDB (not from body — prevents spoofing) → scans all connections → fans out via `PostToConnection`; cleans up stale connections on `GoneException`.
- **Disconnect**: `$disconnect` Lambda reads callsign, deletes connection, broadcasts `user_left`.

### API Gateway WebSocket

Route selection: `$request.body.action`. Routes: `$connect`, `$disconnect`, `sendMessage`.

The management API endpoint for `PostToConnection` is constructed at runtime from the event:
```python
endpoint_url = f"https://{event['requestContext']['domainName']}/{event['requestContext']['stage']}"
```

### DynamoDB (`ChatConnections`)

Single table, partition key `connectionId`. Access patterns: PUT on connect, DELETE on disconnect, SCAN for broadcast. No message history stored. Scan pagination must be handled if table exceeds 1 MB.

### Lambda Environment

All three functions receive `TABLE_NAME` from the SAM template. Runtime: Python 3.12, timeout 10s, 128 MB. `send_message` additionally needs `execute-api:ManageConnections`.

### Frontend WebSocket Lifecycle

Reconnection: 2s initial delay → exponential backoff (2s, 4s, 8s, max 30s) → after 5 failures show manual reconnect button. Callsign stored in app state and reused on reconnect.

Server message types:
```typescript
// Incoming
{ type: "message", callsign, text, timestamp }
{ type: "system", event: "user_joined" | "user_left", callsign, timestamp }
// Outgoing
{ action: "sendMessage", text }
```

## Key Constraints

- `$connect` returning non-200 rejects the WebSocket handshake; `$disconnect` response is informational only (connection already closed).
- The sender's callsign comes from DynamoDB, never from the message body — this is the anti-spoofing design.
- `boto3.client("apigatewaymanagementapi")` must be created per-invocation (endpoint URL is only known at runtime).
- SAM stack name is `anonymous-chat`. DynamoDB table name in production is `ChatConnections`.
- First-time SAM deploy (`--guided`) requires human interaction; Claude Code can run all subsequent deploys.
- AWS credentials must never be committed or handled by Claude Code.
