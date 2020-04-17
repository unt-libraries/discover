module.exports = {
  "extends": "airbnb-base",
  "ignorePatterns": ["node_modules/", "public/", "tmp/"],
  "rules": {
    "func-names": [
      "error",
      "never"
    ],
    "func-style": [
      "off"
    ],
    "import/no-extraneous-dependencies": [
      "off"
    ]
  },
  "env": {
    "browser": true,
    "es6": true,
    "jquery": true,
    "serviceworker": true
  },
  "globals": {
    "Blacklight": "readonly"
  }
};