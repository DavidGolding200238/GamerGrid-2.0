#!/bin/bash
set -euo pipefail
chmod +x /var/app/staging/.platform/hooks/prebuild/*.sh 2>/dev/null || true