const main = require("..");

if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN env variable must be sent");
}

main({
  token: process.env.GITHUB_TOKEN
});
