module.exports = definitionToEndpoint;

const { camelCase } = require("lodash");

const schemaToParams = require("./schema-to-params");

function definitionToEndpoint({ method, url }, definition) {
  const scope = camelCase(definition.tags[0]);
  const idName = camelCase(
    definition.operationId.substr(definition.tags[0].length + 1)
  );

  const params = {};

  // URL, headers and query params
  definition.parameters.forEach(param => {
    if (param.in === "header") {
      return;
    }

    params[param.name] = {
      name: param.name,
      type: param.schema.type,
      enum: param.schema.enum
    };

    if (param.required) {
      params[param.name].required = true;
    }

    if (param.nullable) {
      params[param.name].allowNull = true;
    }

    if (param.pattern) {
      params[param.name].validation = definition.pattern;
    }
  });

  // request body params
  if (definition.requestBody) {
    if (definition["x-github"].requestBodyParameterName) {
      const paramName = definition["x-github"].requestBodyParameterName;
      const contentType = Object.keys(definition.requestBody.content)[0];
      const { schema } = definition.requestBody.content[contentType];
      params[paramName] = {
        name: paramName,
        type: schema.type,
        mapToData: true
      };
      if (schema.type === "array") {
        params[paramName].type = schema.items.type + "[]";
      }

      params[paramName].required = true;
    } else {
      schemaToParams(
        params,
        definition.requestBody.content["application/json"].schema
      );
    }
  }

  const headerParameters = definition.parameters.filter(
    param => param.in === "header"
  );
  const acceptHeader = headerParameters.find(param => param.name === "accept");
  const headers = headerParameters.filter(param => param.name !== "accept");

  const endpoint = {
    id: definition.operationId,
    scope: definition.tags[0],
    name: definition.summary,
    description: definition.description,
    method: method.toUpperCase(),
    url: url.replace(/\{([^}]+)\}/g, ":$1"),
    params: Object.values(params).map(param => {
      if (!param.required) {
        param.required = false;
      }
      if (!param.allowNull) {
        param.allowNull = false;
      }
      if (!param.description) {
        param.description = "";
      }
      return param;
    }),
    deprecated: definition.deprecated,
    changes: definition["x-changes"].map(change => {
      const type = change.type.toUpperCase().replace(/IDNAME/, "ID");
      const meta = change.meta || {};

      return {
        type,
        date: change.date,
        note: change.note,
        before: meta.before
          ? meta.before.idName
            ? meta.before.idName
            : meta.before
          : null,
        after: meta.after
          ? meta.after.idName
            ? meta.after.idName
            : meta.after
          : null
      };
    }),
    documentationUrl: definition.externalDocs.url,
    isLegacy: definition["x-github"].legacy,
    isEnabledForApps: definition["x-github"].enabledForApps,
    isGithubCloudOnly: definition["x-github"].githubCloudOnly
  };

  if (acceptHeader.required) {
    endpoint.headers = {
      accept: acceptHeader.schema.default
    };
  }

  if (headers.length) {
    endpoint.headers = headers.reduce((headers, header) => {
      headers[header.name] = header.schema.enum[0];
      return headers;
    }, endpoint.headers || {});
  }

  return endpoint;
}
