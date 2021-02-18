module.exports = getReleases;

const got = require("got");

const getVercelUrl = require("./get-vercel-url");

async function getReleases() {
  const url = `${getVercelUrl()}/api/releases`;
  console.log(`downloading ${url} ...`);
  const { body } = await got(url);
  console.log(`done.`);
  return JSON.parse(body);
}
