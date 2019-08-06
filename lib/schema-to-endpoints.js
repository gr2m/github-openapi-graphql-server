module.exports = schemaToEndpoints;

const { camelCase } = require("lodash");

const definitionToEndpoint = require("./definition-to-endpoint");

function schemaToEndpoints(schema) {
  const endpoints = [];

  for (const [url, definitions] of Object.entries(schema.paths)) {
    for (const [method, definition] of Object.entries(definitions)) {
      const endpoint = definitionToEndpoint({ method, url }, definition);

      // apply deprecations to avoid breaking changes
      definition["x-changes"].forEach(change => {
        if (change.type === "idName") {
          const scope = camelCase(definition.tags[0]);
          const before = camelCase(change.meta.before.idName);
          const after = camelCase(change.meta.after.idName);

          definitionToEndpoint(
            { method, url },
            Object.assign({}, definition, {
              operationId: [definition.tags[0], change.meta.before.idName].join(
                "-"
              ),
              deprecated: `octokit.${scope}.${before}() has been renamed to octokit.${scope}.${after}() (${
                change.date
              })`
            })
          );
        }

        if (change.type === "parameter") {
          endpoint.params[change.meta.before] = {
            alias: change.meta.after,
            deprecated: true,
            type: endpoint.params[change.meta.after].type
          };
        }
      });

      endpoints.push(endpoint);
    }
  }

  return endpoints;
}
