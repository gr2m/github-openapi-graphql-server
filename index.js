module.exports = main;

const { readFileSync } = require("fs");

const { GraphQLServer } = require("graphql-yoga");
const getEndpoints = require("./lib/get-endpoints");
const getEndpoint = require("./lib/get-endpoint");
const getReleases = require("./lib/get-releases");

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
    }
  };

  const server = new GraphQLServer({ typeDefs, resolvers });
  server.start(() => console.log("Server is running on localhost:4000"));
}
