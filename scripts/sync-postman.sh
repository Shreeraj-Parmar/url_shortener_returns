#!/usr/bin/env bash
# Push openapi.yaml to Postman, replacing the linked collection.
#
# One-time setup:
#   1. Create a Postman API key: https://postman.postman.co/settings/me/api-keys
#   2. export POSTMAN_API_KEY=PMAK-xxxx
#   3. export POSTMAN_WORKSPACE_ID=xxxx   (Workspace -> ... -> Copy workspace ID)
#
# Usage: ./scripts/sync-postman.sh

set -euo pipefail

: "${POSTMAN_API_KEY:?POSTMAN_API_KEY is not set}"
: "${POSTMAN_WORKSPACE_ID:?POSTMAN_WORKSPACE_ID is not set}"

SPEC="$(dirname "$0")/../openapi.yaml"

curl -sS --fail-with-body \
  -X POST "https://api.getpostman.com/import/openapi?workspace=${POSTMAN_WORKSPACE_ID}" \
  -H "X-Api-Key: ${POSTMAN_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c '
import json, sys
spec = open(sys.argv[1]).read()
print(json.dumps({
    "type": "string",
    "input": spec,
    "options": {"folderStrategy": "Tags", "requestNameSource": "Fallback"},
}))
' "$SPEC")"

echo
echo "Imported. Publish docs in Postman: Collection -> View complete documentation -> Publish."
