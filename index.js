module.exports = main;

const { readFileSync } = require("fs");

const { GraphQLServer } = require("graphql-yoga");
const getEndpoints = require("./lib/get-endpoints");
const getReleases = require("./lib/get-releases");

const typeDefs = readFileSync("./schema.graphql", "utf8");

async function main({ token }) {
  const state = { token };

  const resolvers = {
    Query: {
      endpoints: async (_, options) => getEndpoints(state, options),
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
