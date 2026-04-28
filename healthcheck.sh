#!/bin/sh
curl -f "http://localhost:${SLATE_PORT:-8080}/health" || exit 1
