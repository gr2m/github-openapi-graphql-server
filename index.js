module.exports = main;

const { readFileSync } = require("fs");

const getEndpoints = require("./lib/get-endpoints");
const getEndpoint = require("./lib/get-endpoint");
const getReleases = require("./lib/get-releases");
const formatStringResolver = require("./lib/format-string-resolver");

async function main({ token }) {
  const schema = buildSchema(readFileSync("./schema.graphql", "utf8"));

  const state = {
    token,
    endpoints: {},
  };

  const resolvers = {
    Query: {
      endpoints: async (_, options) => getEndpoints(state, options),
      endpoint: async (_, options) => getEndpoint(state, options),
      releases: async () => getReleases(state),
      lastRelease: async () => {
        const [release] = await getReleases(state);
        return release;
      },
    },
    Endpoint: {
      id: formatStringResolver.bind(null, "id"),
      scope: formatStringResolver.bind(null, "scope"),
      previews: (endpoint, { required }) => {
        if (!endpoint.previews) {
          return [];
        }

        if (!required) {
          return endpoint.previews;
        }

        return endpoint.previews.filter((preview) => preview.required);
      },
      changes: (endpoint, { type }) => {
        if (!type) {
          return endpoint.changes;
        }

        return endpoint.changes.filter((change) => change.type === type);
      },
    },
    ScopeAndId: {
      scope: formatStringResolver.bind(null, "scope"),
      id: formatStringResolver.bind(null, "id"),
    },
  };

  graphql(schema, "{ hello }", root).then((response) => {
    console.log(response);
  });
}
