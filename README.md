# TfNSW PIDs
Realistic recreation of Sydney Trains' PIDs using Transport for NSW APIs.

## Pre-requisites
- Node 14.0.0 (or later)
- Yarn Package Manager [(link)](https://yarnpkg.com/)
- CORS Proxy (self-hosted or other)

## Install
1. Run `yarn` to install dependencies
2. Open `src/config.js` and add your proxy details

## Run
1. Run `yarn start`
2. Open [http://localhost:3000/pids](http://localhost:3000/pids) in a browser

Add `?stop={stopID}` to the URL to specify data for a certain station/platform. You can get the `stopID` by searching for your station/light rail stop/bus stop/etc. from [AnyTrip](https://anytrip.com.au/).

#### Made by [@kurisubrooks](https://kurisubrooks.com/)