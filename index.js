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
      id: formatStringResolver.bind(null, 'id'),
      scope: formatStringResolver.bind(null, 'scope')
    },
    Rename: {
      before: formatStringResolver.bind(null, 'before'), 
      after: formatStringResolver.bind(null, 'after')
    }
  };

  const server = new GraphQLServer({ typeDefs, resolvers });
  server.start(() => console.log("Server is running on http://localhost:4000"));
}
