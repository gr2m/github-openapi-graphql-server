module.exports = getEndpoints;

const { filter } = require("lodash");
const got = require("got");

const getReleases = require("./get-releases");
const schemaToEndpoints = require("./schema-to-endpoints");

async function getEndpoints(state, options) {
  const releases = await getReleases(state, options.version);
  const version = options.version || releases[0].version;
  const target = options.ghe || "DOTCOM";

  const knownVersions = releases.map((release) => release.version).join(",");
  if (!knownVersions.includes(version)) {
    throw new Error(
      `Version "${version}" could not be found. Knonw versions are: ${knownVersions}`
    );
  }

  if (!state.endpoints[version]) {
    state.endpoints[version] = {};
  }

  if (!state.endpoints[version][target]) {
    const url = `https://unpkg.com/@github/openapi@${version}/dist/${targetToJsonFilename(
      target
    )}`;
    console.log(`downloading ${url}`);
    const { body } = await got(url);

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
      (endpoint) => endpoint.method === method && endpoint.url === url
    );
  }

  if (!options.ignoreChangesBefore) {
    return result.sort(sortByScopeAndId);
  }

  return result
    .filter((endpoint) => {
      // ignore endpoints that have been removed from the docs
      if (
        endpoint.removalDate &&
        endpoint.removalDate < options.ignoreChangesBefore
      ) {
        return false;
      }

      if (!endpoint.renamed) {
        return true;
      }

      return endpoint.renamed.date >= options.ignoreChangesBefore;
    })
    .map((endpoint) => {
      const renamedParameterNames = endpoint.changes
        .filter(
          (change) =>
            change.type === "PARAMETER" &&
            change.date < options.ignoreChangesBefore
        )
        .map((change) => change.before.name);
      return Object.assign({}, endpoint, {
        parameters: endpoint.parameters.filter((parameter) => {
          return !renamedParameterNames.includes(parameter.name);
        }),
        changes: endpoint.changes.filter((change) => {
          return change.date >= options.ignoreChangesBefore;
        }),
      });
    })
    .sort(sortByScopeAndId);
}

function targetToJsonFilename(target) {
  if (target === "DOTCOM") return "api.github.com-deref.json";

  return target.replace(/^GHE_(\d)(\d+)/, "ghe-$1.$2-deref.json");
}

function sortByScopeAndId(a, b) {
  if (a.scope > b.scope) return 1;
  if (a.scope < b.scope) return -1;

  if (a.id > b.id) return 1;
  if (a.id < b.id) return -1;

  return 0;
}
