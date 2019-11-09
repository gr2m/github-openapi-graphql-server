#!/bin/sh
set -e

now="npx now --debug --token=$ZEIT_TOKEN"

echo "$ now rm --safe --yes octokit-routes-graphql-server"
$now rm --safe --yes octokit-routes-graphql-server

# https://github.com/zeit/now-cli/blob/master/errors/verification-timeout.md
echo "$ now --no-verify"
$now --no-verify

echo "$ now alias --no-verify"
$now alias --no-verify
