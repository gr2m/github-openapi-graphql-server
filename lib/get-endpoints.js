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
    // const url = `https://unpkg.com/@octokit/routes@${version}/api.github.com.json`;
    // console.log(`downloading ${url}`);
    // const { body } = await got(url);

    const body = require("fs").readFileSync(
      "/Users/gregor/Projects/octokit/routes/dist/api.github.com.json",
      "utf8"
    );

    const endpoints = schemaToEndpoints(JSON.parse(body));

    state.endpoints[version] = endpoints;
  }

  let result = state.endpoints[version];
  if (options.filter) {
    result = filter(state.endpoints[version], options.filter);
  }

  if (options.limit) {
    result = result.slice(0, options.limit);
  }

  if (options.route) {
    const [method, url] = options.route.trim().split(/\s+/);
    result = result.filter(
      endpoint => endpoint.method === method && endpoint.url === url
    );
  }

  return result;
}
