module.exports = getReleases;

const graphql = require("@octokit/graphql");
const semver = require("semver");

async function getReleases(state, version) {
  if (state.releases && semver.gte(state.releases[0].version, version)) {
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

  return graphql(query, {
    headers: {
      authorization: `token ${state.token}`
    }
  }).then(({ repository: { releases: { nodes: releases } } }) => {
    state.releases = releases
      .filter(release => {
        const version = release.name.substr(1);
        return semver.gte(version, "23.0.0");
      })
      .map(release => {
        const { createdAt, description } = release;
        return {
          version: release.name.substr(1),
          createdAt,
          description
        };
      });

    return state.releases;
  });
}
