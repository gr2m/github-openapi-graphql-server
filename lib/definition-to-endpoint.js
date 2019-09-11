module.exports = definitionToEndpoint;

const schemaToParams = require("./schema-to-parameters");

function definitionToEndpoint({ method, url }, definition) {
  const parameters = {};

  // URL, headers and query parameters
  definition.parameters.forEach(param => {
    if (param.in === "header") {
      return;
    }

    parameters[param.name] = {
      name: param.name,
      type: param.schema.type,
      enum: param.schema.enum
    };

    if (param.required) {
      parameters[param.name].required = true;
    }

    if (param.nullable) {
      parameters[param.name].allowNull = true;
    }

    if (param.pattern) {
      parameters[param.name].validation = definition.pattern;
    }
  });

  // request body parameters
  if (definition.requestBody) {
    if (definition["x-github"].requestBodyParameterName) {
      const paramName = definition["x-github"].requestBodyParameterName;
      const contentType = Object.keys(definition.requestBody.content)[0];
      const { schema } = definition.requestBody.content[contentType];
      parameters[paramName] = {
        name: paramName,
        type: schema.type,
        mapToData: true
      };
      if (schema.type === "array") {
        parameters[paramName].type = schema.items.type + "[]";
      }

      parameters[paramName].required = true;
    } else {
      schemaToParams(
        parameters,
        definition.requestBody.content["application/json"].schema
      );
    }
  }

  // normalize parameters
  Object.values(parameters).forEach(param => {
    if (!param.required) {
      param.required = false;
    }
    if (!param.allowNull) {
      param.allowNull = false;
    }
    if (!param.description) {
      param.description = "";
    }
  });

  const headerParameters = definition.parameters.filter(
    param => param.in === "header"
  );
  const acceptHeader = headerParameters.find(param => param.name === "accept");
  const headers = headerParameters.filter(param => param.name !== "accept");

  const [scope, id] = definition.operationId.split('/')
  const endpoint = {
    id,
    scope,
    name: definition.summary,
    description: definition.description,
    method: method.toUpperCase(),
    url,
    parameters,
    documentationUrl: definition.externalDocs.url,
    isDeprecated: !!definition.deprecated,
    isLegacy: definition["x-github"].legacy,
    isEnabledForApps: definition["x-github"].enabledForApps,
    isGithubCloudOnly: definition["x-github"].githubCloudOnly,
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
    })
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
