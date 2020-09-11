const test = require("ava");
const got = require("got");

const VERCEL_URL = require("../lib/get-vercel-url")();

const graphql = got.extend({
  prefixUrl: `${VERCEL_URL}/api/`,
  responseType: "json",
  resolveBodyOnly: true,
  method: "POST",
});

test.before(async () => {
  try {
    await got(VERCEL_URL, { method: "HEAD" });
  } catch (error) {
    throw new Error(
      `Server is not running at ${VERCEL_URL}. Try "npm start" in a separate tab`
    );
  }
});

test(`"GET /repos/{owner}/{repo}/issues/{issue_number}" has deprecated "number" parameter with correct in/type/... values`, async (t) => {
  const query = `query ($version: String!) {
    endpoint(version: $version, route: "GET /repos/{owner}/{repo}/issues/{issue_number}") {
      name
      parameters {
        name
        description
        in
        type
        required
        enum
        allowNull
        mapToData
        validation
        alias
        deprecated
      }
    }
  }`;
  const { data } = await graphql("graphql", {
    json: {
      query,
      variables: {
        version: "5.7.1",
      },
    },
  });

  const issueParameter = data.endpoint.parameters.find(
    (parameter) => parameter.name === "number"
  );
  t.deepEqual(issueParameter, {
    name: "number",
    description: "",
    in: "PATH",
    type: "integer",
    required: false,
    enum: null,
    allowNull: false,
    mapToData: null,
    validation: null,
    alias: "issue_number",
    deprecated: true,
  });
});
