module.exports = getVercelUrl;

function getVercelUrl() {
  if (!process.env.VERCEL_URL) {
    return "http://localhost:3000";
  }

  if (/localhost/.test(process.env.VERCEL_URL)) {
    return "http://localhost:3000";
  }

  return `https://${process.env.VERCEL_URL}`;
}
