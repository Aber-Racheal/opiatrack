const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  swSrc: 'public/custom-sw.js',
  fallbacks: {
    document: '/offline.html',
  },
});

module.exports = withPWA({
  reactStrictMode: true,
});
