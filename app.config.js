// App identity per backend. Prod builds are "Ayoreni" (com.ayoreni.app). Dev builds
// (EXPO_PUBLIC_APP_ENV=dev, set by the "dev" profile in eas.json) are a separate app,
// "Ayoreni Dev" (com.ayoreni.app.dev), so both can be installed on one phone and a dev
// install never replaces the real app.
module.exports = ({ config }) => {
  const isDev = (process.env.EXPO_PUBLIC_APP_ENV || '').trim().toLowerCase() === 'dev';

  const identity = isDev
    ? {
        name: `${config.name} Dev`,
        scheme: `${config.scheme}-dev`,
        ios: { ...config.ios, bundleIdentifier: `${config.ios.bundleIdentifier}.dev` },
        android: { ...config.android, package: `${config.android.package}.dev` },
      }
    : {};

  return {
    ...config,
    ...identity,
    experiments: {
      ...config.experiments,
      // baseUrl is only set when building for web with subpath hosting (e.g. GitHub Pages).
      // On native Android/iOS, baseUrl must remain undefined so routes are resolved from root ('/').
      baseUrl: process.env.EXPO_BASE_URL || undefined,
    },
  };
};
