const got = require("got");
const semver = require("semver");

/**
 * Loads releases from https://github.com/github/openapi
 *
 * @param {import("@vercel/node").NowRequest} req
 * @param {import("@vercel/node").NowResponse} res
 */
module.exports = async (req, res) => {
  const { body } = await got("https://registry.npmjs.org/@github%2fopenapi");

  const data = Object.entries(JSON.parse(body).time)
    .map(([version, createdAt]) => {
      if (!/^\d+\.\d+\.\d+$/.test(version)) return;

      return {
        version,
        createdAt,
      };
    })
    .filter(Boolean);

  res.setHeader("cache-control", "s-maxage=180");
  res.json(data.sort(sortDescByVersion));
};

function sortDescByVersion(a, b) {
  return semver.gt(a.version, b.version) ? -1 : 1;
}
