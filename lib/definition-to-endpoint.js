module.exports = definitionToEndpoint;

const schemaToParameters = require("./schema-to-parameters");

function definitionToEndpoint({ method, url }, definition) {
  const parameters = {};

  // URL, headers and query parameters
  definition.parameters.forEach(param => {
    if (param.in === "header") {
      return;
    }

    parameters[param.name] = {
      name: param.name,
      description: param.description,
      type: param.schema.type,
      enum: param.schema.enum,
      in: param.in.toUpperCase()
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
        description: schema.description,
        type: schema.type,
        mapToData: true,
        in: "BODY"
      };
      if (schema.type === "array") {
        parameters[paramName].type = schema.items.type + "[]";
      }

      parameters[paramName].required = true;
    } else {
      schemaToParameters(
        parameters,
        // In most cases the only key for `definition.requestBody.content`
        // is "application/json". But there are exceptios so we just return
        // whatever is first. At this point there is no case with multiple
        // content types.
        Object.values(definition.requestBody.content)[0].schema
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
  const headers = headerParameters
    .filter(param => param.name !== "accept")
    .map(toHeader);

  const [scope, id] = definition.operationId.split("/");

  // if endpoint has a request body and parameters in query, amend the url;
  const queryParameterNames = definition.parameters
    .filter(param => param.in === "query")
    .map(param => param.name);
  if (
    ["delete", "patch", "post", "put"].includes(method) &&
    queryParameterNames.length
  ) {
    url += `{?${queryParameterNames.join(",")}}`;
  }

  // if endpoint has a servers setting, prefix URL with `{baseUrl}`
  // and add `baseUrl` to parameters
  if (definition.servers) {
    url = `{baseUrl}${url}`;
    parameters["baseUrl"] = {
      name: "baseUrl",
      type: "string",
      description: definition.servers[0].variables.baseUrl.description,
      in: "PATH",
      default: definition.servers[0].variables.baseUrl.default
    };
  }

  // {
  //   "200": {
  //     "description": "response",
  //     "content": {
  //       "application/json": {
  //         "example": {}
  //       }
  //     }
  //   }
  // }
  const responses = [];
  for (const code of Object.keys(definition.responses)) {
    const { description } = definition.responses[code];

    if (!definition.responses[code].content) continue;

    for (const mediaType of Object.keys(definition.responses[code].content)) {
      const { schema, example, examples } = definition.responses[code].content[
        mediaType
      ];

      const normalizedExamples = example
        ? [{ data: JSON.stringify(example) }]
        : examples
        ? Object.entries(examples).map(([name, { value }]) => {
            return { name, data: JSON.stringify(value) };
          })
        : undefined;

      responses.push({
        code,
        description,
        mediaType,
        schema: JSON.stringify(schema),
        examples: normalizedExamples
      });
    }
  }

  const endpoint = {
    id,
    scope,
    name: definition.summary,
    description: definition.description,
    method: method.toUpperCase(),
    url,
    parameters,
    headers,
    documentationUrl: definition.externalDocs.url,
    isDeprecated: !!definition.deprecated,
    isLegacy: definition["x-github"].legacy,
    isEnabledForApps: definition["x-github"].enabledForApps,
    isGithubCloudOnly: definition["x-github"].githubCloudOnly,
    previews: definition["x-github"].previews,
    responses,
    changes: definition["x-changes"].map(change => {
      const type = change.type.toUpperCase();
      const before = toParamter(type, change.before);
      const after = toParamter(type, change.after);

      return {
        type,
        date: change.date,
        note: change.note,
        before,
        after
      };
    })
  };

  if (acceptHeader.required) {
    endpoint.headers.unshift(toHeader(acceptHeader));
  }

  return endpoint;
}

function toHeader(param) {
  return {
    name: param.name,
    description: param.description,
    value: param.schema.enum ? param.schema.enum[0] : param.schema.default
  };
}

function toParamter(type, change) {
  if (type === "OPERATION") {
    return change;
  }

  if (!change.name) {
    return;
  }

  return {
    name: change.name,
    type: change.type,
    description: change.description,
    in: change.in
  };
}
