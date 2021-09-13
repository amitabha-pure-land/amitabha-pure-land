module.exports = {
  apps: [
    {
      script: "amtf.js",
      watch: ".",

      env: {
        AMITABHA_MAIN_HOST: "https://namo-amitabha.herokuapp.com",
        PORT: 3000,
      },
      // add development environment variables
      env_development: {
        SERVER_BASE_URL: "http://localhost:3000",
      },
      // add production environment variables
      env_production: {
        NODE_ENV: "production",
        SERVER_BASE_URL: "http://119.8.184.217",
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
        "npm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
