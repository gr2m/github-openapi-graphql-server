#!/bin/sh
set -e

now="npx now@16 --debug --token=$ZEIT_TOKEN"

echo "$ now rm --safe --yes octokit-routes-graphql-server"
$now rm --safe --yes octokit-routes-graphql-server || true

# https://github.com/zeit/now-cli/blob/master/errors/verification-timeout.md
echo "$ now --no-verify"
$now --no-verify

echo "$ now alias --no-verify"
$now alias --no-verify
