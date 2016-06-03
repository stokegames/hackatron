const Framework = require('./Framework');
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework;
import ReactDOM from 'react-dom';

import { renderToString } from 'react-dom/server';

require('./Assets/Vendor/react-universal');
require('./Game/Core/Utils');

import UI from './UI/UI';

ReactDOM.render(<UI />, document.getElementById('ui'));

window.Hackatron = {};


require('./Game/States/Boot');
require('./Game/States/Preload');
require('./Game/States/Menu');
require('./Game/States/Game');

if (Utils.env.os.mobile) {
    Hackatron.GAME_WIDTH = 256; // Game originally designed for 512px
    Hackatron.GAME_HEIGHT = 256 * (window.innerHeight / window.innerWidth); // Game originally designed for 512px
} else {
    Hackatron.GAME_WIDTH = 640; // Game originally designed for 640px
    Hackatron.GAME_HEIGHT = 640; // Game originally designed for 640px
}

Hackatron.UI_WIDTH = Hackatron.GAME_WIDTH; // UI originally designed for 700px
Hackatron.UI_HEIGHT = Hackatron.GAME_HEIGHT; // UI originally designed for 700px
Hackatron.TILE_COUNT_HORIZONTAL = 40;
Hackatron.TILE_COUNT_VERTICAL = 40;
Hackatron.GAME_TIME = 5 * 60;

var gameContainer = document.getElementById('game');
var uiContainer = document.getElementById('ui');

Hackatron.getWidthGameScale = function() {
    return (window.innerWidth / Hackatron.GAME_WIDTH).toFixed(2);
};

Hackatron.getHeightGameScale = function() {
    return (window.innerHeight / Hackatron.GAME_HEIGHT).toFixed(2);
};

Hackatron.getWidthRatioScale = function() {
    return window.innerHeight > window.innerWidth ? 1 : (window.innerHeight / window.innerWidth).toFixed(2);
};

Hackatron.getHeightRatioScale = function() {
    return window.innerHeight > window.innerWidth ? (window.innerWidth / window.innerHeight).toFixed(2) : 1;
};

// Resize UI
window.onresize = function() {
    var smallest = window.innerWidth < window.innerHeight ? window.innerWidth / Hackatron.UI_WIDTH : window.innerHeight / Hackatron.UI_HEIGHT;
    uiContainer.style.zoom = smallest;
};

// Load Game
window.onload = function () {
    Hackatron.debug = window.location.href.indexOf('localhost') !== -1;
    Hackatron.loader = new Phaser.Game(Hackatron.GAME_WIDTH, Hackatron.GAME_HEIGHT, Phaser.AUTO, gameContainer, null, true);

    // Game Constants
    window.DEFAULT_PLAYER_SPEED = 200;
    window.POWERUP_SPAWN_INTERVAL = 5000;
    window.UPDATE_INTERVAL = 100;

    Hackatron.loader.state.add('Boot', Hackatron.Boot);
    Hackatron.loader.state.add('Preload', Hackatron.Preload);
    Hackatron.loader.state.add('Menu', Hackatron.Menu);
    Hackatron.loader.state.add('Game', Hackatron.Game);

    Hackatron.loader.state.start('Boot');

    window.onresize();
};



window.Hackatron.fitToWindow = function() {
    if (window.Hackatron.game) {
        window.Hackatron.game.game.canvas.style['width'] = '100%';
        window.Hackatron.game.game.canvas.style['height'] = '100%';
    }
    //this.game.canvas.style['transform'] = 'perspective(900px) rotateX(15deg) rotate(-3deg)';
    document.getElementById('game').style['width'] = Hackatron.getWidthRatioScale() * 100 + '%';
    document.getElementById('game').style['height'] = Hackatron.getHeightRatioScale() * 100 + '%';
    if (Platform.Env.isMobile) {
        document.body.style['background-size'] = 'contain';
    }
    //document.getElementById('ui').style['transform'] = 'perspective(1000px) rotateX(10deg) rotate(-2deg)';
    window.onresize();
};
