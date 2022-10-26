module.exports = {
    root: true,    
    extends: [
      "eslint:recommended",
      "react-app",
      "react-app/jest"
    ],
    "overrides": [
      {
        "files": ["**/*.js"],
        "env": { "browser": true, "es2021": true, "node": true },
      }
    ]
};