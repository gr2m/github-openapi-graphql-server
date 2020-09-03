const test = require("ava");
const got = require("got");

const VERCEL_URL = require("../lib/get-vercel-url")();

const graphql = got.extend({
  prefixUrl: `${VERCEL_URL}/api/`,
  responseType: "json",
  resolveBodyOnly: true,
  method: "POST",
});

const query = `query ($version:String!, $ghe:GitHubEnterpriseVersion) {
  endpoint(version:$version, ghe:$ghe, route:"GET /user") {
    scope
    id
  }
}`;
const expected = { endpoint: { scope: "users", id: "get-authenticated" } };

test.before(async () => {
  try {
    await got(VERCEL_URL, { method: "HEAD" });
  } catch (error) {
    throw new Error(
      `Server is not running at ${VERCEL_URL}. Try "npm start" in a separate tab`
    );
  }
});

test("Version 4.6.6", async (t) => {
  const { data } = await graphql("graphql", {
    json: {
      query,
      variables: {
        version: "4.6.6",
      },
    },
  });
  t.deepEqual(data, expected);
});

test("Version 4.6.6 and GHE 2.21", async (t) => {
  const { data } = await graphql("graphql", {
    json: {
      query,
      variables: {
        version: "4.6.6",
        ghe: "GHE_221",
      },
    },
  });
  t.deepEqual(data, expected);
});

test("Version 5.0.0", async (t) => {
  const { data } = await graphql("graphql", {
    json: {
      query,
      variables: {
        version: "5.0.0",
      },
    },
  });
  t.deepEqual(data, expected);
});
test("Version 5.0.0 and GHE 2.21", async (t) => {
  const { data } = await graphql("graphql", {
    json: {
      query,
      variables: {
        version: "5.0.0",
        ghe: "GHE_221",
      },
    },
  });
  t.deepEqual(data, expected);
});
