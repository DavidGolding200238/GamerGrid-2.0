#!/bin/bash
set -euo pipefail
# Swap (512MB) for tiny instances
if ! sudo swapon --show | grep -q swapfile; then
  sudo fallocate -l 512M /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=512
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
fi

# Constrain Node heap so build/start don't OOM
export NODE_OPTIONS="--max-old-space-size=256"
echo 'export NODE_OPTIONS="--max-old-space-size=256"' | sudo tee /etc/profile.d/node-heap.sh >/dev/null