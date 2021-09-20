module.exports = {
  apps: [
    {
      script: "amtf.js",
      watch: ".",
      ignore_watch: ["online"],

      env: {
        PORT: 8080,
        SERVER_BASE_URL: "http://13.228.189.66",
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
      key: "~/.ssh/aws-amtf.pem",
      // SSH user
      user: "ubuntu",
      // SSH host
      host: ["13.228.189.66"],
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
      "post-setup": "mkdir -p /home/ubuntu/code/amitabha-pure-land/deploy_buffer/online/",
      // pre-deploy action
      "pre-deploy-local":
        "npm install --only=prod && NODE_ENV=production npm run build && scp -r -i ~/.ssh/aws-amtf.pem .env* ubuntu@13.228.189.66:/home/ubuntu/code/amitabha-pure-land/deploy_buffer/ && scp -r -i ~/.ssh/aws-amtf.pem online/* ubuntu@13.228.189.66:/home/ubuntu/code/amitabha-pure-land/deploy_buffer/online/",
      // post-deploy action
      "post-deploy":
        "npm install --only=prod && npm prune && rm -rf online && mv ../deploy_buffer/.env* . && mv ../deploy_buffer/online . && mkdir ../deploy_buffer/online && pm2 reload ecosystem.config.cjs --env production",
    },
  },
};
