module.exports = schemaToEndpoints;

const definitionToEndpoint = require("./definition-to-endpoint");

function schemaToEndpoints(schema) {
  const endpoints = [];

  for (const [url, definitions] of Object.entries(schema.paths)) {
    for (const [method, definition] of Object.entries(definitions)) {
      const endpoint = definitionToEndpoint({ method, url }, definition);
      const newEndpoints = [endpoint];

      // created new endpoints for past renames
      endpoint.changes.forEach(change => {
        if (change.type === "ID") {
          const renamedEndpoint = Object.assign(
            definitionToEndpoint({ method, url }, definition),
            {
              id: change.before,
              renamed: {
                before: change.before,
                after: change.after,
                date: change.date,
                note: change.note
              }
            }
          );
          newEndpoints.push(renamedEndpoint);
        }
      });
      endpoint.changes.forEach(change => {
        if (change.type === "PARAMETER") {
          newEndpoints.forEach(endpoint => {
            endpoint.parameters[change.before] = {
              name: change.before,
              alias: change.after,
              deprecated: true
            };
          });
        }
      });

      endpoints.push(...newEndpoints);
    }
  }

  return endpoints.map(endpoint => {
    endpoint.parameters = Object.values(endpoint.parameters);
    return endpoint;
  });
}
