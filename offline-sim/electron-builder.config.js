module.exports = {
  appId: "com.limbogame.simulator",
  productName: "Limbo Game Simulator",
  directories: {
    output: "dist",
    buildResources: "build"
  },
  files: [
    "src/**/*",
    "public/**/*",
    {
      "from": "../../crypto.provider.js",
      "to": "."
    },
    {
      "from": "../../crypto.bch.js",
      "to": "."
    },
    {
      "from": "../../crypto.bustadice.js",
      "to": "."
    },
    {
      "from": "../../crypto.stake.js",
      "to": "."
    },
    {
      "from": "../../cli-scripts/randomStringGenerator.js",
      "to": "cli-scripts/randomStringGenerator.js"
    }
  ],
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      },
      {
        target: "portable",
        arch: ["x64"]
      }
    ],
    icon: "build/icon.ico"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"]
      }
    ],
    icon: "build/icon.icns",
    category: "public.app-category.games"
  },
  linux: {
    target: [
      {
        target: "AppImage",
        arch: ["x64"]
      },
      {
        target: "deb",
        arch: ["x64"]
      }
    ],
    icon: "build",
    category: "Game"
  },
  portable: {
    artifactName: "${productName}-Portable-${version}.${ext}"
  }
};
