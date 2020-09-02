const withLess = require('@zeit/next-less');
module.exports = withLess({
  lessLoaderOptions: {
    javascriptEnabled: true
  },
    typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
});