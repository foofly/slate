#!/bin/sh
curl -f "http://localhost:${SLATE_PORT:-5147}/health" || exit 1
