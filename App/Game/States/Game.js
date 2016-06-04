import Map2D from '../Objects/Map2D';
import Tron from '../Objects/Tron';
import Player from '../Objects/Player';
import Enemy from '../Objects/Enemy';
import Countdown from '../Objects/Countdown';
import Gameover from '../Objects/Gameover';
import Powerup from '../Objects/Powerup';
import AI from '../Core/AI';

const Framework = require('../../Framework');
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework;

import Projectile from '../Components/Projectile';
import Block from '../Components/Block';
import PlayerLeaveBehaviour from '../Components/PlayerLeaveBehaviour';
import CollideEnemyBehaviour from '../Components/CollideEnemyBehaviour';
import CollideWallBehaviour from '../Components/CollideWallBehaviour';
import FollowMouseBehaviour from '../Components/FollowMouseBehaviour';
import CharDeathBehaviour from '../Components/CharDeathBehaviour';
import AiController from '../Components/AiController';
import MobileMovementController from '../Components/MobileMovementController';
import Multiplayer from '../Components/Multiplayer';
import PowerupController from '../Components/PowerupController';
import EnemyController from '../Components/EnemyController';


var updateTimeout;
var alpha = 0;

class Game {
    constructor(game) {
        this.enemy = null;
        this.hostId = null;
        this.player = null;
        this.blocks = [];
        this.players = null;
        this.gameState = {
            startTime: null,
            timeLeft: null
        };
        this.collisionDebuggingEnabled = false;
        this.soundEnabled = false;

        this.components = {
            'Projectile': new Projectile(this),
            'Block': new Block(this),
            'PlayerLeaveBehaviour': new PlayerLeaveBehaviour(this),
            'CollideEnemyBehaviour': new CollideEnemyBehaviour(this),
            'CollideWallBehaviour': new CollideWallBehaviour(this),
            'FollowMouseBehaviour': new FollowMouseBehaviour(this),
            'CharDeathBehaviour': new CharDeathBehaviour(this),
            'AiController': new AiController(this),
            'MobileMovementController': new MobileMovementController(this),
            'Multiplayer': new Multiplayer(this),
            'PowerupController': new PowerupController(this),
            'EnemyController': new EnemyController(this)
        };
    }

    toggleFullscreen() {
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        } else {
            this.game.scale.startFullScreen();
        }
    }

    getTileAt(params) {
        if (!typeof(params) === 'object') { throw new Error('Invalid args'); }

        for (var i = 0; i < this.map.collideTiles.length; i++) {
            var tile = this.map.collideTiles[i];
            if (tile.tilePosition.x === params.x && tile.tilePosition.y === params.y) {
                return tile;
            }
        }

        return null;
    }

    getValidPosition() {
        var position = null;
        var currentPosition = 0;
        var totalPositions = Hackatron.TILE_COUNT_HORIZONTAL * Hackatron.TILE_COUNT_VERTICAL * 2;

        while (!position && currentPosition < totalPositions) {
            var x = this.game.rnd.integerInRange(1, Hackatron.TILE_COUNT_HORIZONTAL - 1);
            var y = this.game.rnd.integerInRange(1, Hackatron.TILE_COUNT_VERTICAL - 1);
            // mapData goes top to down and left to right
            var tile = this.getTileAt({x: x, y: y});

            // Check it's a floor tile with no power up there yet
            if (!tile && !this.powerups[x][y]) {
                position = {x: x, y: y};
            }

            totalPositions++;
        }

        // We tried once for each tile on the map, twice, with no success
        // Lets just put them at 1,1
        if (!position) {
            position = {x: 1, y: 1};
        }

        //console.log(position);

        return position;
    }

    resizeGame(width, height) {
        this.game.width = width;
        this.game.height = height;

        if (this.game.renderType === 1) {
            this.game.renderer.resize(width, height);
            Phaser.Canvas.setSmoothingEnabled(this.game.context, false);
        }
    }

    create() {
        Hackatron.game = this;

        document.body.className += ' game';

        this.game.plugins.cameraShake = this.game.plugins.add(Phaser.Plugin.CameraShake);

        this.game.plugins.cameraShake.setup({
            shakeRange: 40,
            shakeCount: 35,
            shakeInterval: 15,
            randomShake: true,
            randomizeInterval: true,
            shakeAxis: 'xy'
        });

        this.players = {};
        this.socket = io.connect();
        this.events = [];

        this.initPhysics();
        this.initMap();
        this.components['PowerupController'].init();
        this.initPlayer();
        this.initSFX();
        this.initHotkeys();

        // Register to listen to events and inform
        // other players that you have joined the game
        this.registerToEvents();

        this.initEvents();

        this.game.stage.disableVisibilityChange = true;

        window.UI_state.screenKey = 'game';
        window.UI_controller.setState(window.UI_state);

        this.components['Multiplayer'].joinGame();
    }

    initEvents() {
        this.eventsInterval = setInterval(this.broadcastEvents.bind(this), 100);

        var lastUpdateInfo = null;

        // Send player position every 50ms
        this.updatePosInterval = setInterval(() => {
            this.player.character.updatePos();

            if (!this.player.character.sprite.body) { return;}
            if (!this.player.character.dirty) { return; }

            var info = {
                id: this.player.id,
                position: this.player.character.position,
                direction: this.player.character.direction
            };

            // Don't send an event if its the same as last time
            if (lastUpdateInfo && info.position.x == lastUpdateInfo.position.x
                && info.position.y == lastUpdateInfo.position.y) {
                return;
            }

            this.fireEvent({key: 'updatePlayer', info: info});

            lastUpdateInfo = info;
        }, Hackatron.UPDATE_INTERVAL);
    }

    initPhysics() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    }

    initHotkeys() {
        this.fullscreenKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
        this.fullscreenKey.onDown.add(this.toggleFullscreen, this);
        this.aiKey = this.game.input.keyboard.addKey(Phaser.Keyboard.I);
        this.aiKey.onDown.add(this.toggleAI, this);

        this.components['MobileMovementController'].init();
    }

    onControlDown(key) {
        if (key === 'att') {
            this.player.character.sprite.attKey.onDown.dispatch();
        } else {
            this.player.character.sprite[key + 'Key'].isDown = true;
        }
    }

    onControlUp(key) {
        if (key === 'att') {
        } else {
            this.player.character.sprite['leftKey'].isDown = false;
            this.player.character.sprite['rightKey'].isDown = false;
            this.player.character.sprite['upKey'].isDown = false;
            this.player.character.sprite['downKey'].isDown = false;
        }
    }

    onAction(action) {
        if (action === 'swipeLeft') {
            this.onControlUp();
            this.onControlDown('left');
        } else if (action === 'swipeRight') {
            this.onControlUp();
            this.onControlDown('right');
        } else if (action === 'swipeUp') {
            this.onControlUp();
            this.onControlDown('up');
        } else if (action === 'swipeDown') {
            this.onControlUp();
            this.onControlDown('down');
        } else if (action === 'tap') {
            this.onControlDown('att');
        }
    }

    toggleAI() {
        this.ai.enabled = !this.ai.enabled;
    }

    initPlayer() {
        var worldPosition = this.getValidPosition();

        var playerParams = {
            id: Utils.generateId(),
            game: this.game,
            name: this.getRandomName(),
            speed: Hackatron.DEFAULT_PLAYER_SPEED,
            worldPosition: worldPosition,
            points: 1000,
            keys: { // TODO: Could be architected better
                up: Phaser.Keyboard.UP,
                down: Phaser.Keyboard.DOWN,
                left: Phaser.Keyboard.LEFT,
                right: Phaser.Keyboard.RIGHT,
                att: Phaser.Keyboard.SPACEBAR
            }
        };

        this.player = new Player();
        this.player.init(playerParams);

        if (Utils.env.os.mobile) {
            this.game.camera.follow(this.player.character.sprite, Phaser.Camera.FOLLOW_LOCKON);
        }
    }

    initMap() {
        this.map = new Map2D();
        this.map.init({game: this.game, player: this.player, enemy: this.enemy});

        // var start = this.map.tilemap.objects['GameObjects'][0];
        // var end = this.map.tilemap.objects['GameObjects'][1];

        // var teleStart = new Phaser.Rectangle(start.x, start.y, start.width, start.height);
        // var teleEnd = new Phaser.Rectangle(end.x, end.y, end.width, end.height);
        // TODO: do stuff with tele points

    }

    initCountdown() {
        var countdown = new Countdown();
        countdown.init({game: this.game, player: this.player});
        countdown.start();
    }

    initGameover() {
        if (this.isGameOver) { return; }

        this.isGameOver = true;

        this.game.plugins.cameraShake.shake();

        var gameover = new Gameover();
        gameover.init(this.game);
        gameover.start();

        setTimeout(function() {
            window.location.reload();
        }, 2000);
        //this.shutdown();
    }


    initSFX() {
        this.musicKey = this.input.keyboard.addKey(Phaser.Keyboard.M);
        // var fx = this.game.add.audio('sfx');
        // fx.addMarker('monsterRoar', 2, 1.2);
        // fx.addMarker('playerEaten', 5, 0.5);
        // fx.addMarker('playerInWater', 7, 0.5);
        // fx.addMarker('jump', 0, 0.24);
    }

    fireEvent(event) {
        this.events.push(event);

        if (event.key === 'projectileFired'
        || event.key === 'blockSpawned') {
            this.parseEvent(event);
        }
    }

    broadcastEvents() {
        if (!this.events.length) { return; }

        //console.log('Broadcasting events...', JSON.stringify({events: this.events}));

        this.socket.emit('events', JSON.stringify({events: this.events}));
        this.events = [];
    }

    moveToPointer() {
        // Use path finder

    }

    update() {
        if (this.musicKey.isDown) {
            this.game.music.mute = !this.game.music.mute;
        }

        this.player.character.inputRight = false;
        this.player.character.inputLeft = false;
        this.player.character.inputUp = false;
        this.player.character.inputDown = false;

        this.components['FollowMouseBehaviour'].run();
        this.components['CollideWallBehaviour'].run();
        this.components['CollideEnemyBehaviour'].run();
        this.components['PowerupController'].update();

        var collideProjectileHandler = (index) => {
            // We don't want to destroy projectiles on contact
            this.player.character.dirty = true;

            this.player.removePoints(10);
            window.UI_GameController.setState(window.GameState);
        };

        var collideBlockHandler = () => {
            this.player.character.dirty = true;
            this.player.removePoints(2);
            window.UI_GameController.setState(window.GameState);
        };

        this.blocks.forEach((block) => {
            //console.log(block);
            if (this.player.character.collisionEnabled) {
                this.game.physics.arcade.collide(this.player.character.sprite, block, collideBlockHandler);
            }

            if (this.enemy) {
                this.game.physics.arcade.collide(this.enemy.character.sprite, block, () => {

                });
            }
        });

        this.components['Projectile'].update();

        if (this.player) {
            this.game.world.bringToTop(this.player.character.sprite);
        }
    }

    fitToWindow() {
        this.game.canvas.style['margin'] = 'auto';

        if (this.isGameOver) {
        } else {
            var pers = 700; //1500 - ((500 / 32) * this.player.character.worldPosition.y);
            var xDeg = 15;
            var yDeg = 0;
            var zDeg = 0;
            var rDeg = -3;
            var xSkew = 0; // (1 - ((2 / 32) * this.player.character.worldPosition.x));

            if (Utils.env.os.mobile) {
                this.game.canvas.style['width'] = '110%';
                this.game.canvas.style['height'] = '110%';
                this.game.canvas.style['margin-top'] = '-20%';
            } else {
                this.game.canvas.style['width'] = '90%';
                this.game.canvas.style['height'] = '90%';
            }
            this.game.canvas.style['transform'] = 'perspective(' + pers + 'px) skew(' + xSkew + 'deg, 0deg) rotateX(' + xDeg + 'deg) rotateY(' + yDeg + 'deg) rotate(' + rDeg + 'deg)';
        }

        if (Platform.Env.isMobile) {
            document.getElementById('game').style['width'] = 100 + '%';
            document.getElementById('game').style['height'] = 100 + '%';
            document.getElementById('ui').style['transform'] = 'none';
        } else {
            document.getElementById('game').style['width'] = Hackatron.getWidthRatioScale() * 100 + '%';
            document.getElementById('game').style['height'] = Hackatron.getHeightRatioScale() * 100 + '%';
            document.getElementById('ui').style['transform'] = 'none';
        }
    }

    shutdown() {
        this.socket.removeAllListeners('events');
        this.powerupInterval && clearInterval(this.powerupInterval);
        this.updatePosInterval && clearInterval(this.updatePosInterval);
        this.eventsInterval && clearInterval(this.eventsInterval);
        this.enemyInterval && clearInterval(this.enemyInterval);
        this.powerupCheckInterval && clearInterval(this.powerupCheckInterval);
        this.player = null;
        this.enemy = null;
        this.hostId = null;
        this.events = [];
    }

    render() {
        this.fitToWindow();
        this.collisionDebugging();

        if (this.player && this.enemy) {
            var distance = this.game.physics.arcade.distanceBetween(this.player.character.sprite, this.enemy.character.sprite);
            var DANGER_DISTANCE = 300;

            if (distance > DANGER_DISTANCE) {
                alpha = 0;
            } else {
                alpha = (DANGER_DISTANCE - distance) / DANGER_DISTANCE;
                if (this.tweenRed) {
                    this.tweenRed.stop();
                }

                this.map.tilemap.layers[2].alpha = alpha;
                //this.tweenRed = this.game.add.tween(this.map.tilemap.layers[2]).to({alpha: alpha}, 50, 'Linear', true, 0, 1);
            }
        }

        if (this.gameState.startTime) {
            var dif = new Date(this.gameState.startTime).getTime() - new Date().getTime();

            this.gameState.timeLeft = (Hackatron.GAME_TIME - Math.abs(dif / 1000)).toFixed(2);

            if (this.gameState.timeLeft <= 0) {
                this.gameState.timeLeft = 0;
                // Show game over
                // CONTINUE HERE
                this.initGameover();
            }

            // TODO: remove this hack
            window.GameState.timeLeft = this.gameState.timeLeft;
            window.UI_GameController.setState(window.GameState);

        }
    }

    collisionDebugging() {
        if (!this.collisionDebuggingEnabled) { return; }
        this.game.debug.bodyInfo(this.player.character.sprite, 32, 32);
        this.game.debug.body(this.player.character.sprite);
    }

    getPlayerById(playerId) {
        if (playerId == this.player.id) {
            return this.player;
        }
        if (this.players[playerId]) {
            return this.players[playerId];
        }

        return null;
    }

    getRandomName() {
        var names = ['riffongrief', 'Blood', 'Midnight', 'Puritytempest', 'Jester', 'Goldmagus', 'Lightning', 'Madguard', 'Lionshadow', 'Tempest', 'Eternity', 'Faunaguard', 'Lordbeast', 'Darklord', 'Veil', 'Tombmourner', 'Hateghost', 'Spirittotem', 'Cometzealot', 'Wind', 'Paradox', 'Tombsinner', 'Darkgod', 'Reaper', 'Firereaper', 'Shadowhowl', 'Spiritlord', 'Gust', 'Song', 'Lord', 'Gunner', 'Dawn', 'King', 'King', 'Knightkiller', 'Rubyguard', 'Whitemidnight', 'Flame', 'Roseice', 'Mourner', 'Lordicon', 'Pandemonium', 'Fellkiller', 'Rascalfinder', 'Claw', 'Ragechaos', 'Ragnarok', 'Demonheart', 'Talonknight', 'Bane', 'Windseeker', 'Warsaber', 'Lionslayer', 'Veil', 'Darkbeast', 'Honorreaper', 'Lancequake', 'Victory', 'Warlockmage', 'Nemesis', 'Queen', 'Bloodbattler', 'Jericho', 'Roguegriffon', 'Wanderlust', 'Mageslayer', 'Cursefinder', 'Legend', 'Beastclaw', 'Shadow', 'Faunaknight', 'Grave', 'Demonfinder', 'Fauna', 'Cult', 'Noblewarlock', 'Faunachanter', 'Battler', 'Talonreaper', 'Steeliron'];

        return names[Math.floor(Math.random() * names.length)]
    }

    createPlayer(playerId) {
        var player = new Player();

        player.init({
            id: playerId,
            game: this.game,
            speed: Hackatron.DEFAULT_PLAYER_SPEED
        });

        this.players[playerId] = player;

        // We probably don't need physics for other players - they are telling us where they are already
        //this.game.physics.arcade.collide(player.character.sprite, this.map.layer);
        this.game.physics.arcade.collide(player.character.sprite, this.player.character.sprite, () => {
            this.player.removePoints(5);
            player.removePoints(5);
        }, null, this.game);

        return player;
    }

// ============================================================================
//                          Socket Event Handlers
// ============================================================================
    parseEvent(event) {
        console.log('Got event: ' + event.key, event.info);

        // Method for updating board local client game state using info
        // broadcasted to all players. The info variable contains the
        // following keys:
        // {player: {id: 1}, position: {x, y}, direction: 'walkRight'}
        if (event.key === 'updatePlayer') {
            var id = event.info.id;
            var position = event.info.position;
            var direction = event.info.direction;

            // Don't update ourself (bug?)
            if (event.info.id === this.player.id) { return; }

            var player = this.getPlayerById(id);

            if (!player) { return; }

            // disable animations for now - lag?
            if (player.character.sprite.body) {
                player.character.sprite.animations.play(direction, 3, false);
                player.character.position = position;
            }
        } else if (event.key === 'updateEnemy') {
            if (event.info.owner === this.player.id) { return; }
            if (!this.enemy) { return; }

            this.enemy.character.position = event.info.position;
        // When new player joins, host shall send them data about the 'position'
        } else if (event.key === 'powerupSpawned') {
            // TODO: we already do this above, refactor it out
            var powerup = new Powerup();
            powerup.init({key: event.info.handler.key, game: this.game, map: this.map, player: this.player, state: event.info.handler.state});
            powerup.handler.on('started', () => { this.fireEvent({key: 'foundPowerup', info: {player: {id: this.player.id}, state: powerup.handler.state}}); });
            powerup.handler.on('destroyed', (params) => { params.positions.forEach((position) => { this.powerups[position.x][position.y] = null; }); });

            this.powerups[powerup.handler.state.position.x][powerup.handler.state.position.y] = powerup;
        // Method for handling spawned blocks by other players
        } else if (event.key === 'foundPowerup') {
            // TODO: we already do this above, refactor it out
            var powerup = this.powerups[event.info.state.position.x][event.info.state.position.y];

            if (powerup) {
                this.powerups[event.info.state.position.x][event.info.state.position.y] = null;
                powerup.handler.player = this.getPlayerById(event.info.player.id);
                powerup.handler.start();
            }
        // Method for handling spawned blocks by other players
        } else if (event.key === 'blockSpawned') {
            this.components['Block'].run(event);
        } else if (event.key === 'projectileFired') {
            this.components['Projectile'].run(event);
        }

        this.components['Multiplayer'].runEvent(event);
    }

    registerToEvents() {
        // Method for receiving multiple events at once
        // {events: [{key: 'eventName', info: {...data here...}]}
        this.socket.on('events', (data) => {
            data.events.forEach((event) => { this.parseEvent(event); });
        });
    }
}

Hackatron.Game = Game;
