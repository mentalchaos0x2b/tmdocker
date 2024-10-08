const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

require('dotenv').config();

module.exports = {
  packagerConfig: {
    asar: true,
    name: "TMDocker",
    icon: 'src/assets/media/icons/docker.ico',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        icon: 'src/assets/media/icons/docker.ico',
        setupIcon: 'src/assets/media/icons/docker.ico',
        
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        icon: 'src/assets/media/icons/docker.ico'
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        icon: 'src/assets/media/icons/docker.ico'
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'mentalchaos0x2b',
          name: 'tmdocker',
        },
        prerelease: false,
        draft: false,
        authToken: process.env.GITHUB_TOKEN
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
