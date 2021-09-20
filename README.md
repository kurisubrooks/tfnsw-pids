# TfNSW PIDs
Realistic recreation of Sydney Trains' PIDs using Transport for NSW APIs.

<img src="https://user-images.githubusercontent.com/6291467/134010023-1d91dbe7-aeb2-4b75-b831-57a73d41c85e.png" width="30%"> <img src="https://user-images.githubusercontent.com/6291467/134010490-cefca401-7825-4e46-8c9e-91ed89c0f79d.png" width="30%"> <img src="https://user-images.githubusercontent.com/6291467/134010750-b843201c-b3a3-4559-9d31-81e9d741365b.png" width="30%">
<img src="https://user-images.githubusercontent.com/6291467/134010967-4470da61-7bc3-4561-9ac2-d4fac63210ab.png" width="30%"> <img src="https://user-images.githubusercontent.com/6291467/134010973-b6f76726-3161-4a36-a9f8-78a0176ab156.png" width="30%"> <img src="https://user-images.githubusercontent.com/6291467/134011554-db9c5b9c-ebcc-45a2-a860-ce5c11f1f8be.png" width="30%">
<img src="https://user-images.githubusercontent.com/6291467/134012932-5c28471c-4f6b-49c6-a21f-b024f77cb3f1.png" width="30%"> <img src="https://user-images.githubusercontent.com/6291467/134012882-957ede49-49c8-4f6e-a4fd-7aece3364964.png" width="30%"> <img src="https://user-images.githubusercontent.com/6291467/134012446-870f2b48-78a5-4600-a93e-13193e3d99be.png" width="30%">

## Pre-requisites
- Node.js 14.0.0 (or later)
- CORS Proxy (self-hosted or other)

## Install
1. Run `git clone https://github.com/kurisubrooks/tfnsw-pids/` to download the files
2. Run `cd tfnsw-pids` to enter the directory
3. Run `yarn` or `npm install` to install dependencies
4. Edit `src/config.js` and add your proxy details

## Run
1. Run `yarn start` or `npm start`
2. Open [http://localhost:3000/pids](http://localhost:3000/pids) in a browser

## Config
#### Proxy (Required)
Fill the values in `src/config.js` with the details of your CORS proxy.

#### URL Params
Format: `url?key=value&key=value`
| Key | Default Value | Description |
| --- | --- | --- |
| `stop` | `200060` (Central Station) | Specify the station/platform ID |
| `theme` | `light` |  Specify `dark` or `light` colour themes |

You can get the `stop` ID by searching for your station/light rail stop/bus stop/etc. from [AnyTrip](https://anytrip.com.au/).

URL Example:  
http://localhost:3000/pids?stop=200060&theme=dark

### Credits
Made by [@kurisubrooks](https://kurisubrooks.com/)  
Special Thanks to [Efren Palacios](https://efrenpalacios.dev/)  

Transport for NSW data sourced from https://anytrip.com.au, with permission.
