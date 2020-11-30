const got = require("got");
const semver = require("semver");

/**
 * Loads releases from https://github.com/octokit/openapi
 *
 * Setting a `GITHUB_TOKEN` environment variable should not be necessary for local testing,
 * but the servers on Vercel are likely blocked from sending unauthorized requests.
 *
 * @param {import("@vercel/node").NowRequest} req
 * @param {import("@vercel/node").NowResponse} res
 */
module.exports = async (req, res) => {
  try {
    const { body } = await got(
      "https://api.github.com/repos/octokit/openapi/releases?per_page=100",
      {
        headers: process.env.GITHUB_TOKEN
          ? {
              authorization: `token ${process.env.GITHUB_TOKEN}`,
            }
          : {},
      }
    );
    const data = JSON.parse(body);
    const versions = data
      .map((release) => {
        return {
          version: release.tag_name.substr(1),
          created_at: release.created_at,
        };
      })
      .filter((release) => semver.valid(release.version))
      .sort((a, b) => semver.compare(b.version, a.version));

    res.setHeader("cache-control", "s-maxage=180");
    res.json(versions);
  } catch (error) {
    console.error(error);

    res.status(500);
    res.json({ error });
  }
};
