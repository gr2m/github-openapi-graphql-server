module.exports = getEndpoint;

const getEndpoints = require("./get-endpoints");

async function getEndpoint(options) {
  if (!options.route) {
    throw new Error("route parameter is required for endpoint() queries");
  }

  const endpoints = await getEndpoints(options);

  const [methodOption, url] = options.route.split(/\s+/);
  const method = methodOption.toUpperCase();

  // remind users to use {parameter} instead of :parameter
  if (/:/.test(url)) {
    const fixedUrl = url.toLowerCase().replace(/:(\w+)/g, "{$1}");
    throw new Error(
      `URL parameters use {parameter} syntax, not :parameter. Try "${fixedUrl}"`
    );
  }

  return endpoints.find(
    (endpoint) => endpoint.method === method && endpoint.url === url
  );
}
