const withNextra = require("nextra")({
  theme: "./theme/index.tsx",
});

module.exports = withNextra({
  reactStrictMode: true,
});
