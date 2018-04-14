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
```bash
$ git clone https://github.com/stokegames/alcyone.git
```

Install dependencies:
```bash
$ cd alcyone
$ npm install
```

Spin up a local game server:
```bash
$ npm start
```

Open [http://localhost:10020](http://localhost:10020) in your browser & enjoy! :)

### Game Design

Checkout the [Game Design Document](GDD.md)!

### Technology Stack

* Web Server: WebPack, Express, Postgres
* iOS/Android App: React Native
* Libs: Phaser.io (Game Engine), Pixi.js (Graphics), EasyStar (AI/Pathfinding), UI (React.js)

### Apps

* Webapp: http://hackatron.rocks/
* Facebook: https://apps.facebook.com/233102823719500/
* Apple AppStore: TBD
* Google PlayStore: TBD

### iTunes Deployment

Test iOS:
```bash
$ react-native bundle --platform ios --entry-file ./App/index.ios.js --bundle-output ./App/Build/Release/main.jsbundle --dev false --resetCache && webpack --progress -p
```

Deploy an iOS app:
```bash
$ react-native bundle --platform ios --entry-file ./App/index.ios.js --bundle-output ./App/Build/Release/main.jsbundle --dev false --resetCache && webpack --progress -p && code-push release Hackatron ./App 1.0.0
```

If it says 8081 is currently in use:
```bash
$ lsof -n -i4TCP:8081
$ kill -9 <PID>
```

Build webapp: `webpack --progress -p`

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
