module.exports = getEndpoints;

const jsonSchemaRefParser = require("@gr2m/json-schema-ref-parser");

const getReleases = require("./get-releases");
const schemaToEndpoints = require("./schema-to-endpoints");

async function getEndpoints(state, options) {
  if (state.endpoints) {
    return state.endpoints;
  }

  const releases = await getReleases(state);
  const version = options.version || releases[0].version;
  const knownVersions = releases.map(release => release.version);

  if (!knownVersions.includes(version)) {
    throw new Error(
      `Version "${version}" could not be found. Knonw versions are: ${knownVersions.join(
        ","
      )}`
    );
  }

  const url = `https://raw.githubusercontent.com/octokit/routes/v${version}/openapi/api.github.com/index.json`;
  console.log(`downloading ${url}`);

  state.endpoints = jsonSchemaRefParser
    .dereference(url, {
      resolve: { http: { retries: 3 } }
    })
    .then(schemaToEndpoints)
    .then(endpoints => {
      return endpoints.map(endpoint => {
        return {
          id: endpoint.id,
          scope: endpoint.scope,
          name: endpoint.name,
          description: endpoint.description,
          method: endpoint.method,
          url: endpoint.url,
          deprecated: endpoint.deprecated,
          documentationUrl: endpoint.documentationUrl,
          isLegacy: endpoint.isLegacy,
          isEnabledForApps: endpoint.isEnabledForApps,
          isGithubCloudOnly: endpoint.isGithubCloudOnly,
          parameters: endpoint.params,
          changes: endpoint.changes
        };
      });
    });

  return state.endpoints;
}
