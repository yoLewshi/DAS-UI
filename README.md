
# DAS UI

This is a frontend React app built by NIWA for use with OpenRVDAS.

![Home page](docs/home_example.png)

![Persistent Loggers](docs/loggers.png)

![Dark Theme](docs/dark_theme.png)


## Developing Locally

This app runs on vite. You can run it locally if you have node.js installed by running `npm install` in the root directory then `npm run dev`. You will need to create a `.env` file using `.env.dist` as a guide to set the location of the openrvdas backend.

## Building and Deploying in Production

Run `npm run build` to create the `dist` folder then run `install_das-ui.sh` to build the docker image.