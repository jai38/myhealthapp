module.exports = ({ config }) => {
  return {
    ...config,
    experiments: {
      ...config.experiments,
      // baseUrl is only set when building for web with subpath hosting (e.g. GitHub Pages).
      // On native Android/iOS, baseUrl must remain undefined so routes are resolved from root ('/').
      baseUrl: process.env.EXPO_BASE_URL || undefined,
    },
  };
};
