workflow "Deploy on push" {
  on       = "push"

  resolves = [
    "remove older deployments"
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
