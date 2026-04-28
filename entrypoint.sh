#!/bin/sh
set -e

echo "Starting Slate..."
echo "  Vault: ${SLATE_VAULT_PATH}"
echo "  Port:  ${SLATE_PORT}"

mkdir -p "${SLATE_VAULT_PATH}"

CMD="uvicorn server.main:app --host ${SLATE_HOST} --port ${SLATE_PORT} --proxy-headers --forwarded-allow-ips=*"

if [ "$(id -u)" = "0" ]; then
  chown -R "${PUID}:${PGID}" "${SLATE_VAULT_PATH}"
  exec gosu "${PUID}:${PGID}" sh -c "$CMD"
else
  exec sh -c "$CMD"
fi
