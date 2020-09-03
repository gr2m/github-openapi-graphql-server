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

const workaroundRoutes = [
  "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/runners/{runner_id}",
  "POST /orgs/{org}/actions/runner-groups",
  "DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}",
  "GET /orgs/{org}/actions/runner-groups/{runner_group_id}",
  "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories",
  "GET /orgs/{org}/actions/runner-groups",
  "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/runners",
  "DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}",
  "DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}/runners/{runner_id}",
  "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories",
  "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/runners",
  "PATCH /orgs/{org}/actions/runner-groups/{runner_group_id}",
  "PUT /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations/{org_id}",
  "PUT /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners/{runner_id}",
  "POST /enterprises/{enterprise}/actions/runners/registration-token",
  "POST /enterprises/{enterprise}/actions/runners/remove-token",
  "POST /enterprises/{enterprise}/actions/runner-groups",
  "DELETE /enterprises/{enterprise}/actions/runners/{runner_id}",
  "DELETE /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}",
  "GET /enterprises/{enterprise}/actions/runners/{runner_id}",
  "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}",
  "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations",
  "GET /enterprises/{enterprise}/actions/runners/downloads",
  "GET /enterprises/{enterprise}/actions/runner-groups",
  "GET /enterprises/{enterprise}/actions/runners",
  "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners",
  "DELETE /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations/{org_id}",
  "DELETE /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners/{runner_id}",
  "PUT /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations",
  "PUT /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners",
  "PATCH /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}",
];

for (const route of workaroundRoutes) {
  test(`"${route}" should return "isGithubCloudOnly: true"`, async (t) => {
    const query = `query ($version: String!, $route: String!) {
      endpoint(version: $version, route: $route) {
        isGithubCloudOnly
      }
    }
    `;
    const expected = { endpoint: { isGithubCloudOnly: true } };
    const { data } = await graphql("graphql", {
      json: {
        query,
        variables: {
          version: "5.6.1",
          route,
        },
      },
    });
    t.deepEqual(data, expected);
  });
}
