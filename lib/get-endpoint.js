module.exports = getEndpoint;

const getEndpoints = require("./get-endpoints");

async function getEndpoint(state, options) {
  if (!options.route) {
    throw new Error("route parameter is required for endpoint() queries");
  }

  const endpoints = await getEndpoints(state, options);

  const [methodOption, urlOption] = options.route.split(/\s+/);
  const method = methodOption.toUpperCase();
  const url = urlOption.toLowerCase().replace(/:(\w+)/g, "{$1}");

  return endpoints.find(
    endpoint => endpoint.method === method && endpoint.url === url
  );
}
