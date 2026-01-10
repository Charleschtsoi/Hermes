module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NativeWind v4 uses Metro transformer, so babel plugin may not be needed
    // If you need it, uncomment the line below:
    // plugins: ['nativewind/babel'],
  };
};
