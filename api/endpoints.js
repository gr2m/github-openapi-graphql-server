const got = require("got");

const getReleases = require("../lib/get-releases");
const schemaToEndpoints = require("../lib/schema-to-endpoints");

/**
 * Loads de-referenced OpenAPI specification from @github/openapi via unpkg.com. Caches the response for a year
 *
 * @param {import("@vercel/node").NowRequest} req
 * @param {import("@vercel/node").NowResponse} res
 */
module.exports = async (req, res) => {
  const releases = await getReleases();
  const version = req.query.version || releases[0].version;

  const knownVersions = releases.map((release) => release.version).join(",");
  if (!knownVersions.includes(version)) {
    res.status(404);
    res.json({
      error: `Version "${version}" could not be found. Knonw versions are: ${knownVersions}`,
    });
    return;
  }

  // const url = `https://unpkg.com/@github/openapi@${version}/dist/${toJsonFileName(
  const url = toFileUrl(version, req.query.ghe);
  console.log(`downloading ${url}`);
  const { body } = await got(url);

  const endpoints = schemaToEndpoints(JSON.parse(body));

  res.setHeader("cache-control", "s-maxage=31536000");
  res.json(endpoints);
};

const BASE_URL =
  "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions";
function toFileUrl(version, ghe) {
  if (!ghe) {
    return `${BASE_URL}/api.github.com/dereferenced/api.github.com.deref.json`;
  }

  const [, mainVersion, subVersion] = ghe.match(/^GHE_(\d)(\d+)/);

  return `${BASE_URL}/ghes-${mainVersion}.${subversion}/dereferenced/ghes-${mainVersion}.${subversion}.deref.json`;
}
