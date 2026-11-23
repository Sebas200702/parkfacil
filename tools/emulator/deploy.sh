#!/usr/bin/env bash
# Despliega todo ParkFácil en AWS Emulator y carga datos de demostración.
# Requisitos: aws-emulator corriendo (aws-emulator -t off) y AWS CLI v2.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
source "$ROOT/tools/emulator/emulator-env.sh"
STACK="${STACK_NAME:-parkfacil}"
BUCKET="parkfacil-artifacts"
OUT="$(mktemp -d)"

# El lab trae LabRole con permisos amplios; en el emulador hay que crearlo.
aws iam get-role --role-name LabRole >/dev/null 2>&1 || aws iam create-role --role-name LabRole \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":["lambda.amazonaws.com","scheduler.amazonaws.com"]},"Action":"sts:AssumeRole"}]}' >/dev/null
aws iam put-role-policy --role-name LabRole --policy-name lab-like --policy-document \
  '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["dynamodb:*","scheduler:*","ses:*","cognito-idp:*","iam:PassRole","lambda:InvokeFunction","logs:*","iot:*"],"Resource":"*"}]}'
aws s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1 || aws s3 mb "s3://$BUCKET" >/dev/null

(cd "$ROOT/services/api" && node build.mjs)
aws cloudformation package --template-file "$ROOT/infra/template.yaml" --s3-bucket "$BUCKET" \
  --output-template-file "$OUT/packaged.yaml" >/dev/null
STATUS="$(aws cloudformation describe-stacks --stack-name "$STACK" --query 'Stacks[0].StackStatus' --output text 2>/dev/null || true)"
[[ "$STATUS" == UPDATE_*IN_PROGRESS ]] && aws cloudformation wait stack-update-complete --stack-name "$STACK"

# En actualizaciones el emulador ejecuta el changeset por su cuenta y `deploy` responde
# InvalidChangeSetStatus (EXECUTE_IN_PROGRESS); en ese caso solo se espera a que termine.
if ! LOG="$(aws cloudformation deploy --template-file "$OUT/packaged.yaml" --stack-name "$STACK" \
  --capabilities CAPABILITY_AUTO_EXPAND --no-fail-on-empty-changeset \
  --parameter-overrides SensorApiKey=dev-sensor-key 2>&1)"; then
  grep -q EXECUTE_IN_PROGRESS <<<"$LOG" || { echo "$LOG"; exit 1; }
  aws cloudformation wait stack-update-complete --stack-name "$STACK"
fi
echo "Stack $STACK: $(aws cloudformation describe-stacks --stack-name "$STACK" --query 'Stacks[0].StackStatus' --output text)"

output() { aws cloudformation describe-stacks --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
(cd "$ROOT/services/api" && TABLE_NAME="$(output TableName)" USER_POOL_ID="$(output UserPoolId)" npx tsx src/scripts/seed.ts)
rm -rf "$OUT"
