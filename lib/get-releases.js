module.exports = getReleases;

const got = require("got");

async function getReleases() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const { body } = await got(`${baseUrl}/api/releases`);
  return JSON.parse(body);
}
