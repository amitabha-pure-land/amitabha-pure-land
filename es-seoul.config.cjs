module.exports = {
  apps: [
    {
      script: "amtf.js",
      watch: ".",

      env: {
        PORT: 8080,
        SERVER_BASE_URL: "http://3.36.243.6",
      },
      // add development environment variables
      env_development: {
        DEBUG: "express-http-proxy",
      },
      // add production environment variables
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    // "production" is the environment name
    production: {
      // SSH key path, default to $HOME/.ssh
      key: "~/.ssh/aws-amtf-seoul.pem",
      // SSH user
      user: "ubuntu",
      // SSH host
      host: ["3.36.243.6"],
      // SSH options with no command-line flag, see 'man ssh'
      // can be either a single string or an array of strings
      ssh_options: "StrictHostKeyChecking=no",
      // GIT remote/branch
      ref: "origin/master",
      // GIT remote
      repo: "https://github.com/amitabha-pure-land/amitabha-pure-land.github.io.git",
      // path in the server
      path: "/home/ubuntu/code/amitabha-pure-land",
      // Pre-setup command or path to a script on your local machine
      "pre-setup": "",
      // Post-setup commands or path to a script on the host machine
      // eg: placing configurations in the shared dir etc
      "post-setup": "",
      // pre-deploy action
      "pre-deploy-local": "",
      // post-deploy action
      "post-deploy":
        "npm install --only=prod && NODE_ENV=production npm run build && pm2 reload es-seoul.config.cjs --env production",
    },
  },
};
