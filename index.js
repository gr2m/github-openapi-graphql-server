module.exports = main;

const { readFileSync } = require("fs");

const { GraphQLServer } = require("graphql-yoga");

const getEndpoints = require("./lib/get-endpoints");
const getEndpoint = require("./lib/get-endpoint");
const getReleases = require("./lib/get-releases");
const formatStringResolver = require("./lib/format-string-resolver");

const typeDefs = readFileSync("./schema.graphql", "utf8");

async function main({ token }) {
  const state = {
    token,
    endpoints: {}
  };

  const resolvers = {
    Query: {
      endpoints: async (_, options) => getEndpoints(state, options),
      endpoint: async (_, options) => getEndpoint(state, options),
      releases: async () => getReleases(state),
      lastRelease: async () => {
        const [release] = await getReleases(state);
        return release;
      }
    },
    Endpoint: {
      id: formatStringResolver.bind(null, "id"),
      scope: formatStringResolver.bind(null, "scope"),
      previews: (endpoint, { required }) => {
        // compatibility with routes < 23.1.1
        if (!endpoint.previews) {
          return [];
        }

        if (!required) {
          return endpoint.previews;
        }

        return endpoint.previews.filter(preview => preview.required);
      },
      changes: (endpoint, { type }) => {
        if (!type) {
          return endpoint.changes;
        }

        return endpoint.changes.filter(change => change.type === type);
      }
    },
    ScopeAndId: {
      scope: formatStringResolver.bind(null, "scope"),
      id: formatStringResolver.bind(null, "id")
    }
  };

  const server = new GraphQLServer({ typeDefs, resolvers });
  server.start(() => console.log("Server is running on http://localhost:4000"));
}
