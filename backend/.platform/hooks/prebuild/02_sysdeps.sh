#!/bin/bash
set -euo pipefail
dnf install -y gcc-c++ make python3 git || true
# for bcrypt
dnf install -y openssl-devel || true