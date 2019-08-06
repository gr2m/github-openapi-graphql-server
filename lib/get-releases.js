module.exports = getReleases;

const graphql = require("@octokit/graphql");
const semver = require("semver");

async function getReleases(state) {
  if (state.releases) {
    return state.releases;
  }

  console.log(`loading releases`);

  const query = `query {
    repository(owner:"octokit", name:"routes") {
      releases(first: 100, orderBy:{field:CREATED_AT, direction:DESC}) {
        nodes {
          name
          createdAt
          description
        }
      }
    }
  }`;

  state.releases = graphql(query, {
    headers: {
      authorization: `token ${state.token}`
    }
  }).then(({ repository: { releases: { nodes: releases } } }) => {
    return releases
      .filter(release => {
        const version = release.name.substr(1);
        return semver.gte(version, "20.0.0");
      })
      .map(release => {
        const { createdAt, description } = release;
        return {
          version: release.name.substr(1),
          createdAt,
          description
        };
      });
  });

  return state.releases;
}
