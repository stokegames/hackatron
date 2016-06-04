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
//import MovingBehaviour from '../Components/MovingBehaviour';


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
            'FollowMouseBehaviour': new FollowMouseBehaviour(this)
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
        this.initPowerUps();
        this.initPlayer();
        this.initSFX();
        this.initHotkeys();

        // Register to listen to events and inform
        // other players that you have joined the game
        this.registerToEvents();
        this.joinGame();

        this.initEvents();

        this.game.stage.disableVisibilityChange = true;

        window.UI_state.screenKey = 'game';
        window.UI_controller.setState(window.UI_state);
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
        }, UPDATE_INTERVAL);

        // If this is the host
        // Send enemy position every 50ms
        this.enemyInterval = setInterval(() => {
            if (this.enemy && this.player.id === this.hostId) {
                //this.enemy.character.updatePos();

                if (!this.enemy.character.dirty) { return; }

                this.enemy.character.dirty = false;

                var info = {
                    position: this.enemy.character.position,
                    direction: this.enemy.character.direction
                };

                this.fireEvent({key: 'updateEnemy', info: info});
            }
        }, UPDATE_INTERVAL);
    }

    initPhysics() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    }

    initHotkeys() {
        this.fullscreenKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
        this.fullscreenKey.onDown.add(this.toggleFullscreen, this);
        this.aiKey = this.game.input.keyboard.addKey(Phaser.Keyboard.I);
        this.aiKey.onDown.add(this.toggleAI, this);

        // variables used to detect and manage swipes
        var startX;
        var startY;
        var endX;
        var endY;

        // when the player begins to swipe we only save mouse/finger coordinates, remove the touch/click
        // input listener and add a new listener to be fired when the mouse/finger has been released,
        // then we call endSwipe function
        var beginSwipe = function() {
            startX = this.game.input.worldX;
            startY = this.game.input.worldY;
            this.game.input.onDown.remove(beginSwipe, this);
            this.game.input.onUp.add(endSwipe, this);
        };

        // function to be called when the player releases the mouse/finger
        var endSwipe = function() {
            // saving mouse/finger coordinates
            endX = this.game.input.worldX;
            endY = this.game.input.worldY;
            // determining x and y distance travelled by mouse/finger from the start
            // of the swipe until the end
            var distX = startX-endX;
            var distY = startY-endY;
            // in order to have an horizontal swipe, we need that x distance is at least twice the y distance
            // and the amount of horizontal distance is at least 10 pixels
            if (Math.abs(distX)>Math.abs(distY)*2 && Math.abs(distX)>30){
                // moving left, calling move function with horizontal and vertical tiles to move as arguments
                if (distX > 0) {
                    this.onAction('swipeLeft');
                }
                // moving right, calling move function with horizontal and vertical tiles to move as arguments
                else {
                    this.onAction('swipeRight');
                }
            }
            // in order to have a vertical swipe, we need that y distance is at least twice the x distance
            // and the amount of vertical distance is at least 10 pixels
            else if (Math.abs(distY)>Math.abs(distX)*2 && Math.abs(distY)>30){
                // moving up, calling move function with horizontal and vertical tiles to move as arguments
                if (distY > 0) {
                    this.onAction('swipeUp');
                }
                // moving down, calling move function with horizontal and vertical tiles to move as arguments
                else {
                    this.onAction('swipeDown');
                }
            }
            else {
                this.onAction('tap');
            }

            // stop listening for the player to release finger/mouse, let's start listening for the player to click/touch
            this.game.input.onDown.add(beginSwipe, this);
            this.game.input.onUp.remove(endSwipe, this);
        };

        // Wait for the player to touch or click
        this.game.input.onDown.add(beginSwipe, this);
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

    runAiSystem() {
        this.ai = new AI();
        this.ai.init({game: this.game, player: this.player, enemy: this.enemy, map: this.map});
    }

    runEnemySystem() {
        // Create enemy for the host
        if (!this.enemy) {
            var worldPosition = this.getValidPosition();

            this.enemy = new Enemy();
            this.enemy.init({
                game: this.game,
                speed: DEFAULT_PLAYER_SPEED,
                worldPosition: worldPosition,
                keys: { // TODO: Could be architected better
                    up: Phaser.Keyboard.W,
                    down: Phaser.Keyboard.S,
                    left: Phaser.Keyboard.A,
                    right: Phaser.Keyboard.D
                }
            });
        }
    }

    initPlayer() {
        var worldPosition = this.getValidPosition();

        var playerParams = {
            id: Utils.generateId(),
            game: this.game,
            name: this.getRandomName(),
            speed: DEFAULT_PLAYER_SPEED,
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

    initDeathScreen() {
        this.game.plugins.cameraShake.shake();

        this.enemy.character.worldPosition = this.getValidPosition();
        this.enemy.character.frozen = true;

        // var death = new Gameover();
        // death.init(this.game);
        // death.start();

        this.player.removePoints(100);

        for(var id in this.players) {
            this.players[id].addPoints(100 / this.players.length);
        }

        window.UI_GameController.setState(window.GameState);

        this.newGameKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.newGameKey.onDown.add(() => {
            // Remove death screen

            this.newGameKey.onDown.remove();
        });

        setTimeout(() => {
            //death.sprite.destroy();
            this.player.character.worldPosition = this.getValidPosition();
            this.player.character.revive();

            setTimeout(() => {
                this.enemy.character.frozen = false;
            }, 1000);
        }, 2000);
    }

    initSFX() {
        this.musicKey = this.input.keyboard.addKey(Phaser.Keyboard.M);
        // var fx = this.game.add.audio('sfx');
        // fx.addMarker('monsterRoar', 2, 1.2);
        // fx.addMarker('playerEaten', 5, 0.5);
        // fx.addMarker('playerInWater', 7, 0.5);
        // fx.addMarker('jump', 0, 0.24);
    }

    initPowerUps() {
        this.powerups = [];
        for (var i = 0; i <= Hackatron.TILE_COUNT_VERTICAL; i++) {
            this.powerups.push([]);
        }

        this.powerupCheckInterval = setInterval(() => {
            this.powerups.forEach((_, row) => {
                this.powerups[row].forEach((_, column) => {
                    var powerup = this.powerups[row][column];
                    if (powerup && powerup.handler.ended) {
                        this.powerups[row][column] = null;
                    }
                });
            });
        }, 1000);
    }

    runPowerUpSystem() {
        var run = () => {
            var powerupHandlers = Object.keys(Powerup.handlers);
            var randomHandler = powerupHandlers[this.game.rnd.integerInRange(0, powerupHandlers.length-1)];
            var powerup = new Powerup();
            powerup.init({key: randomHandler, game: this.game, map: this.map, player: this.player});
            powerup.handler.on('started', () => { this.fireEvent({key: 'foundPowerup', info: {state: powerup.handler.state, player: {id: this.player.id}}}); });
            powerup.handler.on('destroyed', (params) => { params.positions.forEach((position) => { this.powerups[position.x][position.y] = null; }); });

            this.powerups[powerup.handler.state.position.x][powerup.handler.state.position.y] = powerup;

            this.fireEvent({key: 'powerupSpawned', info: {handler: {key: randomHandler, state: powerup.handler.state}}});
        };

        this.powerupInterval = setInterval(run, POWERUP_SPAWN_INTERVAL);

        run();
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

        this.powerups.forEach((row) => {
            row.forEach((powerup) => {
                if (powerup) {
                    powerup.handler.update();
                }
            });
        });

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
            speed: DEFAULT_PLAYER_SPEED
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

    welcomePlayer(playerId) {
        // Add players
        var players = [];
        for(playerId in this.players) {
            var player = this.players[playerId];

            players.push({
                id: player.id,
                name: player.name,
                position: player.character.position,
                points: player.points
            });
        }

        // Add the host
        // TODO: Wat? Needs clarification
        players.push({
            id: this.player.id,
            name: this.player.name,
            position: this.player.character.position,
            points: this.player.points
        });

        // Add powerups
        var powerups = [];
        for(var row in this.powerups) {
            for(var column in this.powerups[row]) {
                var powerup = this.powerups[row][column];

                if (!powerup) { continue; }

                powerups.push({handler: {key: powerup.handler.key, state: powerup.handler.state}});
            }
        }

        // Compile the game data
        var gameData = {
            player: {id: playerId},
            enemy: {position: this.enemy.character.position},
            powerups: powerups,
            players: players,
            gameState: this.gameState
        };

        this.fireEvent({key: 'welcomePlayer', info: gameData});
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
            if (this.player.id !== this.hostId) {
                if (this.enemy) {
                    this.enemy.character.position = event.info.position;
                }
            }
        // When new player joins, host shall send them data about the 'position'
        } else if (event.key === 'newPlayer') {
            // If we're this player, we don't need to do anything
            if (this.player.id === event.info.player.id) { return; }

            if (this.player.id === this.hostId) {
                this.welcomePlayer(event.info.player.id);
            }

            var player = this.getPlayerById(event.info.player.id);

            if (!player) {
                player = this.createPlayer(event.info.player.id);
            }

            player.name = event.info.player.name;
            player.character.position = event.info.player.position;

            console.log('New player ' + event.info.player.id + ' has joined the game!');
        // Set up game state as a new player receiving game data from host
        } else if (event.key === 'welcomePlayer') {
            if (this.player.id === event.info.player.id) {
                // Setup players
                event.info.players.forEach((playerInfo) => {
                    var player = this.createPlayer(playerInfo.id);
                    player.name = playerInfo.name;
                    if (playerInfo.position) {
                        player.character.position = playerInfo.position;
                    }
                    player.points = playerInfo.points;

                    this.players[player.id] = player;
                });

                // Setup enemy
                this.enemy = new Enemy();

                this.enemy.init({
                    game: this.game,
                    speed: DEFAULT_PLAYER_SPEED,
                    position: event.info.enemy.position
                });

                // Setup powerups
                event.info.powerups.forEach((powerupInfo) => {
                    var powerup = new Powerup();
                    powerup.init({key: powerupInfo.handler.key, game: this.game, map: this.map, player: this.player, state: powerupInfo.handler.state});
                    powerup.handler.on('destroyed', (params) => { params.positions.forEach((position) => { this.powerups[position.x][position.y] = null; }); });

                    this.powerups[powerup.handler.state.position.x][powerup.handler.state.position.y] = powerup;
                });

                this.gameState = event.info.gameState;
            }
        // Method for handling received deaths of other clients
        } else if (event.key === 'playerKilled') {
            var player = this.players[event.info.player.id];

            if (player) {
                player.kill();
            }

            this.player.addPoints(100 / this.players.length);
            window.UI_GameController.setState(window.GameState);
        // Method for handling player leaves
        } else if (event.key === 'playerLeave') {
            this.components['PlayerLeaveBehaviour'].run(event);
        // Method for handling spawned power ups by the host
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
        } else if (event.key === 'setHost') {
            // If there's currently no host then this is a new game
            // There should be a countdown
            if (!this.hostId) {
                this.initCountdown();
            }
            // Check if we already know this is the host,
            // And if it's this player, we don't need to set ourselves up again
            if (this.hostId === event.info.player.id) { return; }

            this.hostId = event.info.player.id;

            // If this player is the new host, lets set them up
            if (this.hostId === this.player.id) {
                console.log('Hey now the host, lets do this!\n' + this.hostId);

                this.runEnemySystem();

                if (!this.gameState.startTime) {
                    this.gameState.startTime = new Date();
                }

                setTimeout(() => {
                    this.runAiSystem();
                    this.runPowerUpSystem();
                }, 3000);
            }
        }
    }

    registerToEvents() {
        // Method for receiving multiple events at once
        // {events: [{key: 'eventName', info: {...data here...}]}
        this.socket.on('events', (data) => {
            data.events.forEach((event) => { this.parseEvent(event); });
        });
    }

    // Method to broadcast to  other clients (if there are any) that you have
    // joined the game
    joinGame() {
        this.fireEvent({key: 'newPlayer', info: {
            player: {
                id: this.player.id,
                name: this.player.name,
                position: this.player.character.position
            }
        }});
    }
}

Hackatron.Game = Game;
