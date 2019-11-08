module.exports = getEndpoints;

const got = require("got");
const { filter } = require("lodash");

const getReleases = require("./get-releases");
const schemaToEndpoints = require("./schema-to-endpoints");

async function getEndpoints(state, options) {
  const releases = await getReleases(state);
  const version = options.version || releases[0].version;
  const target = options.ghe || "DOTCOM";

  const knownVersions = releases.map(release => release.version).join(",");
  if (!knownVersions.includes(version)) {
    throw new Error(
      `Version "${version}" could not be found. Knonw versions are: ${knownVersions}`
    );
  }

  if (!state.endpoints[version]) {
    state.endpoints[version] = {};
  }

  if (!state.endpoints[version][target]) {
    // const url = `https://unpkg.com/@octokit/routes@${version}/${targetToJsonFilename(target)}`;
    // console.log(`downloading ${url}`);
    // const { body } = await got(url);
    const body = require("fs").readFileSync(
      "/Users/gregor/Projects/octokit/routes/dist/api.github.com.json",
      "utf8"
    );

    const endpoints = schemaToEndpoints(JSON.parse(body));

    state.endpoints[version][target] = endpoints;
  }

  let result = state.endpoints[version][target];
  if (options.filter) {
    result = filter(state.endpoints[version][target], options.filter);
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

function targetToJsonFilename(target) {
  if (target === "DOTCOM") return "api.github.com.json";

  return target.replace(/^GHE_(\d)(\d+)/, "ghe-$1.$2.json");
}
