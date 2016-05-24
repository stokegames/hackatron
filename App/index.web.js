import React from 'react';
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
    Hackatron.GAME_WIDTH = 512; // Game originally designed for 512px
    Hackatron.GAME_HEIGHT = 512; // Game originally designed for 512px
}

Hackatron.UI_WIDTH = 700; // UI originally designed for 700px
Hackatron.UI_HEIGHT = 700; // UI originally designed for 700px
Hackatron.TILE_COUNT_HORIZONTAL = 32;
Hackatron.TILE_COUNT_VERTICAL = 32;

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
    var smallest = window.innerHeight > window.innerWidth ? gameContainer.offsetWidth / Hackatron.UI_WIDTH : gameContainer.offsetHeight / Hackatron.UI_HEIGHT;
    uiContainer.style.left = (100 - parseInt(gameContainer.style.width)) / 2 + '%';
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
