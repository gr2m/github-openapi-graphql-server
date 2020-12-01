const { readdirSync, readFileSync } = require("fs");

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

for (const filename of readdirSync("test/queries")) {
  const path = `test/queries/${filename}`;
  test(path, async (t) => {
    const query = readFileSync(path, "utf-8");
    const { data } = await graphql("graphql", {
      json: {
        query,
        variables: {
          version: "1.0.5",
        },
      },
    });
    t.snapshot(data);
  });
}
