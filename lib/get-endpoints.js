module.exports = getEndpoints;

const got = require("got");
const { filter } = require("lodash");

const getReleases = require("./get-releases");
const schemaToEndpoints = require("./schema-to-endpoints");

async function getEndpoints(state, options) {
  const releases = await getReleases(state);
  const version = options.version || releases[0].version;

  const knownVersions = releases.map(release => release.version).join(",");
  if (!knownVersions.includes(version)) {
    throw new Error(
      `Version "${version}" could not be found. Knonw versions are: ${knownVersions}`
    );
  }

  if (!state.endpoints[version]) {
    const url = `https://unpkg.com/@octokit/routes@23.0.0/api.github.com.json`;
    console.log(`downloading ${url}`);

    const { body } = await got(url);
    const endpoints = schemaToEndpoints(JSON.parse(body));

    state.endpoints[version] = endpoints
  }

  if (options.filter) {
    return filter(state.endpoints[version], options.filter)
  }

  return state.endpoints[version];
}
