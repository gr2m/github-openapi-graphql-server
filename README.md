# Octokit Routes GraphQL Server

> Send GraphQL queries against the OpenAPI specification of GitHub's REST API

The OpenAPI specification exists at [octokit/routes](https://github.com/octokit/routes). All REST API endpoints for https://api.github.com as well as the supported GitHub Enterprise (GHE) versions can be queried.

# Usage

Example query

```graphql
{
  endpoints {
    name
    method
    url
    parameters {
      name
      type
    }
  }
}
```

The query loads the definitions from the [latest octokit/routes release on GitHub](https://github.com/octokit/routes/releases/latest). An optional `endpoints(version: "21.0.4") { ... }` parameter can be passed to query a specific version.

All releases can be retrieved using the following query

```graphql
{
  releases {
    version
    createdAt
  }
}
```

The latest release can be retrieved, too

```graphql
{
  lastRelease {
    version
    createdAt
  }
}
```

## License

[MIT](LICENSE)
