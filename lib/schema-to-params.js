module.exports = schemaToParams;

function schemaToParams(params, schema, prefix = "") {
  Object.entries(schema.properties).forEach(([paramName, definition]) => {
    const paramNameWithPrefix = prefix + paramName;
    params[paramNameWithPrefix] = {
      name: paramNameWithPrefix,
      type: definition.type,
      enum: definition.enum,
      description: definition.description
    };

    if (schema.required && schema.required.includes(paramName)) {
      params[paramNameWithPrefix].required = true;
    }

    if (definition.nullable) {
      params[paramNameWithPrefix].allowNull = true;
    }

    if (definition.pattern) {
      params[paramNameWithPrefix].validation = definition.pattern;
    }

    // handle arrays
    if (definition.type === "array") {
      params[paramNameWithPrefix].type = definition.items.type + "[]";

      if (definition.items.type === "object") {
        schemaToParams(params, definition.items, `${paramNameWithPrefix}[].`);
      }
    }

    // handle objects
    if (definition.type === "object") {
      schemaToParams(params, definition, `${paramNameWithPrefix}.`);
    }
  });
}
