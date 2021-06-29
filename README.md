# ⚠️ This repository is archived

The response payload exceded 6MB for some queries which was no longer practical for deployment to Vercel or Begin. I might re-activate this repository in future or create an alternative, but for the time being I recommend https://github.com/gr2m/github-openapi-graphql-query

# GitHub OpenAPI GraphQL Server

> Send GraphQL queries against the OpenAPI specification of GitHub's REST API

The OpenAPI specification is published to [@github/openapi](https://www.npmjs.com/package/@github/openapi). All REST API endpoints for https://api.github.com as well as the supported GitHub Enterprise (GHE) versions can be queried.

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

The query loads the definitions from the [latest `@github/openapi` release on GitHub](https://unpkg.com/@github/openapi/). An optional `endpoints(version: "4.6.6") { ... }` parameter can be passed to query a specific version.

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
