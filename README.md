# TfNSW PIDs
Realistic recreation of Sydney Trains' PIDs using Transport for NSW APIs.

<img src="https://user-images.githubusercontent.com/6291467/133553294-33cb914b-e9c5-4b7b-881a-f49585b44d0c.png" width="30%"> <img src="https://user-images.githubusercontent.com/6291467/133553301-12294b3b-66d9-4e82-b64f-b1951b2552e7.png" width="30%"> <img src="https://user-images.githubusercontent.com/6291467/133553411-dc467fe4-495a-4119-9727-3fadcbd1b1fe.png" width="30%">

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
Special Thanks to [Efren Palacios](https://efrenpalacios.dev/)
