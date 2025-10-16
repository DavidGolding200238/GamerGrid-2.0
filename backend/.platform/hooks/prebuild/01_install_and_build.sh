#!/bin/bash
set -euo pipefail
cd /var/app/staging

# Clean and install with dev deps for build tools (NODE_ENV=production is set by EB)
rm -rf node_modules
npm ci --include=dev

# Build must produce the file you start (see Procfile below)
npm run build