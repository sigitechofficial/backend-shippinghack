# Instance-side deploy script — runs ON the EC2 box via SSM Run Command.
# NOTE: intentionally NO shebang. It is read by the GitHub Actions workflow and
# sent to AWS-RunShellScript as JSON parameters; SSM runs it in the default
# shell. (A shebang + SSM has caused "cannot execute" failures.)
#
# It pulls the latest main, rebuilds .env entirely from SSM using the instance's
# own IAM role (secrets never leave AWS), reinstalls deps, and reloads PM2.
set -uo pipefail
export AWS_DEFAULT_REGION=us-east-1

SSM_APP="/theshippinghack/stage/app"
SSM_DB="/theshippinghack/stage/db"
DEPLOY_DIR="/var/www/theshippinghack-api"

echo "=== GitHub Actions deploy $(date -u) ==="

# GitHub token (instance role can read + decrypt SSM)
GH_TOKEN=$(aws ssm get-parameter --name "/theshippinghack/stage/github/token" --with-decryption --query 'Parameter.Value' --output text)
CLONE_URL="https://x-access-token:${GH_TOKEN}@github.com/sigitechofficial/backend-shippinghack.git"
CLEAN_URL="https://github.com/sigitechofficial/backend-shippinghack.git"

if [ -d "$DEPLOY_DIR/.git" ]; then
  cd "$DEPLOY_DIR"
  git remote set-url origin "$CLONE_URL"
  git fetch origin --prune
  git reset --hard origin/main
else
  rm -rf "$DEPLOY_DIR"
  git clone "$CLONE_URL" "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi
git remote set-url origin "$CLEAN_URL"
echo "Commit: $(git log --oneline -1)"

echo "Writing .env from SSM..."
umask 077
{
  echo "# Auto-generated from SSM on $(date -u) — do not edit"
  echo "DB_HOST=$(aws ssm get-parameter --name $SSM_DB/host --query 'Parameter.Value' --output text)"
  echo "DB_PORT=$(aws ssm get-parameter --name $SSM_DB/port --query 'Parameter.Value' --output text)"
  echo "DB_NAME=$(aws ssm get-parameter --name $SSM_DB/name --query 'Parameter.Value' --output text)"
  echo "DB_USER=$(aws ssm get-parameter --name $SSM_DB/user --query 'Parameter.Value' --output text)"
  echo "DB_PASSWORD=$(aws ssm get-parameter --name $SSM_DB/password --with-decryption --query 'Parameter.Value' --output text)"
  aws ssm get-parameters-by-path --path "$SSM_APP" --recursive --with-decryption \
    --query 'Parameters[].[Name,Value]' --output text \
    | awk -F'\t' '{ n=$1; sub(/.*\//,"",n); print n"="$2 }'
} > "$DEPLOY_DIR/.env"
chmod 600 "$DEPLOY_DIR/.env"
echo ".env written ($(wc -l < "$DEPLOY_DIR/.env") lines)"

echo "Installing dependencies (npm ci)..."
npm ci --omit=dev

cat > "$DEPLOY_DIR/ecosystem.config.js" <<PM2EOF
module.exports = {
  apps: [{
    name: 'theshippinghack-api',
    script: 'shipping.js',
    cwd: '$DEPLOY_DIR',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
};
PM2EOF

if pm2 describe theshippinghack-api > /dev/null 2>&1; then
  pm2 reload "$DEPLOY_DIR/ecosystem.config.js" --update-env
else
  pm2 start "$DEPLOY_DIR/ecosystem.config.js"
fi
pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
pm2 save

echo "Waiting for app to start..."
sleep 7
echo "Local /health:"; curl -s -w " [HTTP %{http_code}]\n" http://localhost:3000/health || echo "(health failed)"
echo "Local /ready:";  curl -s -w " [HTTP %{http_code}]\n" http://localhost:3000/ready  || echo "(ready failed)"
echo "=== deploy finished ==="
