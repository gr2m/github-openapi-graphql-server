workflow "Deploy on push" {
  on       = "push"

  resolves = [
    "remove older deployments"
  ]
}

workflow "Release" {
  on       = "push"

  resolves = [
    "semantic-release"
  ]
}

action "master branch only" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "deploy to now" {
  uses    = "actions/zeit-now@master"

  needs   = [
    "master branch only"
  ]

  secrets = [
    "ZEIT_TOKEN"
  ]
}

action "alias deploy domain" {
  uses    = "actions/zeit-now@master"
  args    = "alias"

  needs   = [
    "deploy to now"
  ]

  secrets = [
    "ZEIT_TOKEN"
  ]
}

action "remove older deployments" {
  uses    = "actions/zeit-now@master"
  args    = "rm --safe --yes octokit-routes-graphql-server"

  needs   = [
    "alias deploy domain"
  ]

  secrets = [
    "ZEIT_TOKEN"
  ]
}

action "npm ci (release)" {
  needs = "master branch only"
  uses  = "docker://timbru31/node-alpine-git"
  runs  = "npm"
  args  = "ci"
}

action "semantic-release" {
  uses    = "docker://timbru31/node-alpine-git"
  runs    = "npx"
  args    = "semantic-release"

  needs   = [
    "master branch only",
    "npm ci (release)"
  ]

  secrets = [
    "GITHUB_TOKEN"
  ]
}
