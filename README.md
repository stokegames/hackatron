```
██╗  ██╗ █████╗  ██████╗██╗  ██╗ █████╗ ████████╗██████╗  ██████╗ ███╗   ██╗
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔══██╗╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║
███████║███████║██║     █████╔╝ ███████║   ██║   ██████╔╝██║   ██║██╔██╗ ██║
██╔══██║██╔══██║██║     ██╔═██╗ ██╔══██║   ██║   ██╔══██╗██║   ██║██║╚██╗██║
██║  ██║██║  ██║╚██████╗██║  ██╗██║  ██║   ██║   ██║  ██║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

## Overview
Hackatron is a multiplayer deathmatch action game.

## Installation
Clone the project:
```
git clone https://github.com/stokegames/hackatron.git
```

Install dependencies:
```
cd hackatron
npm install
```

Spin up a local game server:
```
npm start
```

Open `localhost:8080` in your browser & enjoy! :)

### Game Design

Checkout the [Game Design Document](GDD.md)!

### Technology Stack

* Game Engine: Phaser.io
* Graphics Lib: Pixi.js
* AI Lib: EasyStar
* UI: React.js

### Apps

* Facebook: https://apps.facebook.com/233102823719500/
* iTunes: TBD

### iTunes Deployment

Test iOS:
```
rm -rf package/release/assets/app && cp -R App package/release/assets && mv package/release/assets/App package/release/assets/app && react-native bundle --platform ios --entry-file App/index.ios.js --bundle-output ./package/release/main.jsbundle --assets-dest ./package/release --dev false --resetCache
```

Deploy an iOS app:
```
rm -rf package/release/assets/app && cp -R App package/release/assets && mv package/release/assets/App package/release/assets/app && react-native bundle --platform ios --entry-file App/index.ios.js --bundle-output ./package/release/main.jsbundle --assets-dest ./package/release --dev false --resetCache && code-push release Hackatron ./package/release 1.0.0
```

Build webapp: `webpack --progress -p`

### TODO

- [x] Webapp should be compiled with WebPack
- [x] Should be able to deploy to App Store using React Native
- [ ] Native button should be a core component
- [ ] Proxy react native stuff so it works on web
- [ ] Rename /package/release to /Build/Release

### Credits

Core Game Programmers:
[**@tony-dinh**](https://github.com/tony-dinh)
[**@mingchia-andy-liu**](https://github.com/mingchia-andy-liu)
[**@ericmuyser**](https://github.com/ericmuyser)

Original Prototype @ nwHacks2016:
[**@wesleytsai**](https://github.com/wesleytsai)
[**@stellafang**](https://github.com/stellafang)
[**@chan-kelv**](https://github.com/chan-kelv)
[**@angiecho**](https://github.com/angiecho)
[**@mingchia-andy-liu**](https://github.com/mingchia-andy-liu)
[**@tony-dinh**](https://github.com/tony-dinh)
[**@ericmuyser**](https://github.com/ericmuyser)
