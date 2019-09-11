module.exports = schemaToEndpoints;

const definitionToEndpoint = require("./definition-to-endpoint");

function schemaToEndpoints(schema) {
  const endpoints = [];

  for (const [url, definitions] of Object.entries(schema.paths)) {
    for (const [method, definition] of Object.entries(definitions)) {
      const endpoint = definitionToEndpoint({ method, url }, definition);

      // created new endpoints for past renames
      endpoint.changes.forEach(change => {
        if (change.type === "ID") {
          const scope = definition.tags[0];
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
          endpoints.push(renamedEndpoint);
        }

        if (change.type === "PARAMETER") {
          endpoint.parameters[change.before] = Object.assign(
            {},
            endpoint.parameters[change.after],
            {
              name: change.before,
              alias: change.after,
              deprecated: true
            }
          );
        }
      });

      endpoints.push(endpoint);
    }
  }

  return endpoints.map(endpoint => {
    endpoint.parameters = Object.values(endpoint.parameters);
    return endpoint;
  });
}
