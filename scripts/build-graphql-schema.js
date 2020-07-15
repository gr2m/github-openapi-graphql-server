const { readFileSync, writeFileSync } = require("fs");
const { gql } = require("apollo-server-micro");

const schema = readFileSync("./schema.graphql", "utf8");
const typeDefs = gql(schema);

writeFileSync("./lib/generated/graphql-schema.json", JSON.stringify(typeDefs));
console.log("lib/generated/graphql-schema.json updated.");
