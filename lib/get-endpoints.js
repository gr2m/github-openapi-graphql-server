module.exports = getEndpoints;

const { filter } = require("lodash");
const got = require("got");

async function getEndpoints(options) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const { body } = await got(`${baseUrl}/api/endpoints`, {
    searchParams: {
      version: options.version,
      ghe: options.ghe,
    },
  });
  let result = JSON.parse(body);

  if (options.filter) {
    result = filter(result, options.filter);
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

function sortByScopeAndId(a, b) {
  if (a.scope > b.scope) return 1;
  if (a.scope < b.scope) return -1;

  if (a.id > b.id) return 1;
  if (a.id < b.id) return -1;

  return 0;
}
