const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Extend the default configuration to support 'cjs' files
defaultConfig.resolver.sourceExts.push('cjs');

// Custom configuration for 'svg' files using 'react-native-svg-transformer'
defaultConfig.transformer = {
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Filter out 'svg' from the assetExts and add 'svg' to the sourceExts
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
if (!defaultConfig.resolver.sourceExts.includes('svg')) {
  defaultConfig.resolver.sourceExts.push('svg');
}

module.exports = defaultConfig;