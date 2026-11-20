#!/usr/bin/env bash
# Apunta AWS CLI y SDKs al AWS Emulator local. Uso: source tools/emulator/emulator-env.sh
EMU_DIR="$HOME/.aws/emulator/${EMULATOR_PORT:-9297}"
export AWS_ENDPOINT_URL="https://127.0.0.1:${EMULATOR_PORT:-9297}"
export AWS_SHARED_CREDENTIALS_FILE="$EMU_DIR/emulator_credentials"
export AWS_CONFIG_FILE="$EMU_DIR/config"
export AWS_CA_BUNDLE="$EMU_DIR/ca.pem"
export NODE_EXTRA_CA_CERTS="$EMU_DIR/ca.pem"
export AWS_EC2_METADATA_DISABLED=true
export AWS_DISABLE_HOST_PREFIX_INJECTION=true
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_PROFILE
