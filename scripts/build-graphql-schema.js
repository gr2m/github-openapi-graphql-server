const { readFileSync, writeFileSync } = require("fs");
const { gql } = require("apollo-server-micro");
var deepEqual = require("deep-equal");

const schema = readFileSync("./schema.graphql", "utf8");
const typeDefs = JSON.parse(JSON.stringify(gql(schema)));

const currentTypeDefs = require("../lib/generated/graphql-schema.json");

if (deepEqual(currentTypeDefs, typeDefs)) {
  console.log("lib/generated/graphql-schema.json is already up-to-date.");
  process.exit(0);
}

writeFileSync("./lib/generated/graphql-schema.json", JSON.stringify(typeDefs));
console.log("lib/generated/graphql-schema.json updated.");
