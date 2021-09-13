module.exports = {
  apps: [
    {
      script: "amtf.js",
      watch: ".",

      env: {
        AMITABHA_MAIN_HOST: "https://namo-amitabha.herokuapp.com",
        // DEBUG: "express-http-proxy",
      },
      // add development environment variables
      env_development: {
        PORT: 3000,
        SERVER_BASE_URL: "http://localhost:3000",
      },
      // add production environment variables
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
        SERVER_BASE_URL: "http://13.228.189.66",
      },
    },
  ],

  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/master",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.cjs --env production",
      "pre-setup": "",
    },
  },
};
