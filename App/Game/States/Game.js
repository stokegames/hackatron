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

window.GameState = {
    show: true,
    showOthers: false,
    currentCharacter: 'tron',
    allCharacters: ['tron', 'ghost', 'frosty', 'one'],
    showMenu: false,
    timeLeft: null
};

var updateTimeout;
var alpha = 0;

class Game {
    constructor(game) {
        this.engine = game;
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
    
    isValidPosition(position) {
        const tile = this.getTileAt(position)
        
        return !tile
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
        
        window.document.body.style['background'] = '#000 url(/Assets/UI/Screens/game.jpg) no-repeat 0 0'
        window.document.body.style['background-size'] = 'auto 100%'
        window.document.body.style['overflow'] = 'hidden'

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
        this.events = [];

        this.initPhysics();
        this.initMap();
        this.components['PowerupController'].init();
        this.initPlayer();
        this.initSFX();
        this.initHotkeys();

        this.initEvents();
        this.establishConnection()

        this.game.stage.disableVisibilityChange = true;

        window.UI_state.screenKey = 'game';
        window.UI_controller.setState(window.UI_state);

        this.components['Multiplayer'].joinGame();
    }
    
    establishConnection() {
        const monitor = () => {
            if (!window.io) { return setTimeout(monitor, 50) }
            
            this.socket = window.io.connect()

            // Register to listen to events and inform
            // other players that you have joined the game
            this.registerToEvents()
        }
        
        monitor()
    }

    initEvents() {
        this.eventsInterval = setInterval(this.broadcastEvents.bind(this), 100);

        var lastUpdateInfo = null;

        // Send player position every 50ms
        this.updatePosInterval = setInterval(() => {
            this.player.character.updatePos();

            if (!this.player.character.sprite.body) { return; }
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
        this.keys = {}

        this.keys.fullscreen = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
        this.keys.fullscreen.onDown.add(this.toggleFullscreen, this);
        this.keys.i = this.game.input.keyboard.addKey(Phaser.Keyboard.I);
        this.keys.i.onDown.add(this.toggleAI, this);

        this.keys.up = this.game.input.keyboard.addKey(Phaser.Keyboard.UP)
        this.keys.up.onDown.add(() => this.onAction('up'))
        this.keys.down = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        this.keys.down.onDown.add(() => this.onAction('down'))
        this.keys.left = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
        this.keys.left.onDown.add(() => this.onAction('left'))
        this.keys.right = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
        this.keys.right.onDown.add(() => this.onAction('right'))

        this.keys.w = this.game.input.keyboard.addKey(Phaser.Keyboard.W)
        this.keys.w.onDown.add(() => this.onAction('up'))
        this.keys.s = this.game.input.keyboard.addKey(Phaser.Keyboard.S)
        this.keys.s.onDown.add(() => this.onAction('down'))
        this.keys.a = this.game.input.keyboard.addKey(Phaser.Keyboard.A)
        this.keys.a.onDown.add(() => this.onAction('left'))
        this.keys.d = this.game.input.keyboard.addKey(Phaser.Keyboard.D)
        this.keys.d.onDown.add(() => this.onAction('right'))

        this.keys.att = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        this.keys.att.onDown.add(this.player.character.triggerAttack, this.player.character)

        this.components['MobileMovementController'].init();
    }

    destroyKeys() {
        for (var key in this.keys) {
            this.game.input.keyboard.removeKey(this.keys[key])
        }
    }

    onAction(action) {
        console.log('Action:', action)
        if (action === 'swipeLeft' || action === 'left') {
            this.onControlDown('left');
        } else if (action === 'swipeRight' || action === 'right') {
            this.onControlDown('right');
        } else if (action === 'swipeUp' || action === 'up') {
            this.onControlDown('up');
        } else if (action === 'swipeDown' || action === 'down') {
            this.onControlDown('down');
        } else if (action === 'tap' || action === 'space') {
            this.onControlDown('att');
        }
    }

    onControlDown(key) {
        console.log('Control down:', key)
        if (key === 'att') {
            this.keys.att.onDown.dispatch();
        } else {
            this.player.character.nextDirection = key;
        }
        
        this.checkPlayerDirection()
    }

    onControlUp(key) {
        if (key === 'att') {
        } else {
            this.stopPlayerMovement()
        }
    }

    stopPlayerMovement() {
        for (var key in this.player.character.moving) {
            this.player.character.moving[key] = false
        }
    }
    
    checkInput() {
        const moveDown = this.keys.down.isDown || this.keys.s.isDown
        const moveUp = this.keys.up.isDown || this.keys.w.isDown
        const moveLeft = this.keys.left.isDown || this.keys.a.isDown
        const moveRight = this.keys.right.isDown || this.keys.d.isDown
        //var attacking = this.keys.att.isDown

        if (moveDown) {
            this.onAction('down')
        } else if (moveUp) {
            this.onAction('up')
        } else if (moveLeft) {
            this.onAction('left')
        } else if (moveRight) {
            this.onAction('right')
        }
    }
    
    checkPlayerDirection() {
        var nextDirection = this.player.character.nextDirection

        if (!nextDirection) { return }
        if (nextDirection === this.player.character.currentDirection) { return }

        var worldPosition = this.player.character.worldPosition

        var opening = false
        var nextWorldPosition = null

        if (nextDirection === 'left') {
            nextWorldPosition = {x: worldPosition.x-1, y: worldPosition.y}
        } else if (nextDirection === 'right') {
            nextWorldPosition = {x: worldPosition.x+1, y: worldPosition.y}
        } else if (nextDirection === 'up') {
            nextWorldPosition = {x: worldPosition.x, y: worldPosition.y-1}
        } else if (nextDirection === 'down') {
            nextWorldPosition = {x: worldPosition.x, y: worldPosition.y+1}
        }

        nextWorldPosition.x = Math.floor(nextWorldPosition.x)
        nextWorldPosition.y = Math.floor(nextWorldPosition.y)

        opening = this.isValidPosition(nextWorldPosition)
        if (opening) {
            this.stopPlayerMovement()
            this.player.character.worldPosition = nextWorldPosition
            this.player.character.moving[nextDirection] = true
            this.player.character.currentDirection = nextDirection
            this.player.character.nextDirection = null
        } else {
            
        }
    }

    toggleAI() {
        this.ai.enabled = !this.ai.enabled;
    }

    initPlayer() {
        var worldPosition = this.getValidPosition();

        var playerParams = {
            id: Utils.generateId(),
            game: this.engine,
            name: this.getRandomName(),
            speed: Hackatron.DEFAULT_PLAYER_SPEED,
            worldPosition: worldPosition,
            points: 1000
        };

        this.player = new Player();
        this.player.init(playerParams);

        if (Utils.env.os.mobile) {
            this.engine.camera.follow(this.player.character.sprite, Phaser.Camera.FOLLOW_LOCKON);
        }
    }

    initMap() {
        this.map = new Map2D();
        this.map.init({game: this.engine, player: this.player, enemy: this.enemy});

        this.teleporters = [];

        this.map.tilemap.objects.forEach((layer) => {
            if (layer.name === 'GameObjects') {
                var objects = {};

                layer.objects.forEach((object) => {
                    objects[object.properties.id] = object;
                });

                layer.objects.forEach((object) => {
                    if (object.properties.type === 'teleport') {
                        var target = objects[object.properties.target];
                        var bmd = this.engine.add.bitmapData(object.width, object.height);
                        //bmd.ctx.beginPath(); bmd.ctx.rect(0, 0, object.width, object.height); bmd.ctx.fillStyle = '#ffffff'; bmd.ctx.fill();
                        var teleporter = this.engine.add.sprite(object.x, object.y, bmd);
                        this.engine.physics.arcade.enable(teleporter, Phaser.Physics.ARCADE);
                        teleporter.body.immovable = true;
                        teleporter.target = target;

                        this.teleporters.push(teleporter);
                    }
                });
            }
        });
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
        if (!this.socket) { return }

        //console.log('Broadcasting events...', JSON.stringify({events: this.events}));

        this.socket.emit('events', JSON.stringify({events: this.events}));
        this.events = [];
    }

    update() {
        if (this.musicKey.isDown) {
            this.game.music.mute = !this.game.music.mute;
        }

        this.checkPlayerDirection()

        this.components['FollowMouseBehaviour'].run();
        this.components['CollideWallBehaviour'].run();
        this.components['CollideEnemyBehaviour'].run();
        this.components['PowerupController'].update();

        var collideProjectileHandler = (index) => {
            // We don't want to destroy projectiles on contact
            this.player.character.dirty = true;

            //this.player.removePoints(10);
            window.UI_GameController.setState(window.GameState);
        };

        var collideBlockHandler = () => {
            this.player.character.dirty = true;
            //this.player.removePoints(2);
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

        this.teleporters.forEach((teleporter) => {
            this.game.physics.arcade.collide(this.player.character.sprite, teleporter, () => {
                this.player.character.teleport({x: teleporter.target.x / 16, y: teleporter.target.y / 16});
            });
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
            //this.game.canvas.style['transform'] = 'perspective(' + pers + 'px) skew(' + xSkew + 'deg, 0deg) rotateX(' + xDeg + 'deg) rotateY(' + yDeg + 'deg) rotate(' + rDeg + 'deg)';
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
            window.UI_GameController && window.UI_GameController.setState(window.GameState);
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
        var names = ['Riffongrief', 'Blood', 'Midnight', 'Puritytempest', 'Jester', 'Goldmagus', 'Lightning', 'Madguard', 'Lionshadow', 'Tempest', 'Eternity', 'Faunaguard', 'Lordbeast', 'Darklord', 'Veil', 'Tombmourner', 'Hateghost', 'Spirittotem', 'Cometzealot', 'Wind', 'Paradox', 'Tombsinner', 'Darkgod', 'Reaper', 'Firereaper', 'Shadowhowl', 'Spiritlord', 'Gust', 'Song', 'Lord', 'Gunner', 'Dawn', 'King', 'King', 'Knightkiller', 'Rubyguard', 'Whitemidnight', 'Flame', 'Roseice', 'Mourner', 'Lordicon', 'Pandemonium', 'Fellkiller', 'Rascalfinder', 'Claw', 'Ragechaos', 'Ragnarok', 'Demonheart', 'Talonknight', 'Bane', 'Windseeker', 'Warsaber', 'Lionslayer', 'Veil', 'Darkbeast', 'Honorreaper', 'Lancequake', 'Victory', 'Warlockmage', 'Nemesis', 'Queen', 'Bloodbattler', 'Jericho', 'Roguegriffon', 'Wanderlust', 'Mageslayer', 'Cursefinder', 'Legend', 'Beastclaw', 'Shadow', 'Faunaknight', 'Grave', 'Demonfinder', 'Fauna', 'Cult', 'Noblewarlock', 'Faunachanter', 'Battler', 'Talonreaper', 'Steeliron'];

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
            //this.player.removePoints(5);
            //player.removePoints(5);
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

        this.components['Multiplayer'].run(event);
    }

    registerToEvents() {
        if (!this.socket) { return }

        // Method for receiving multiple events at once
        // {events: [{key: 'eventName', info: {...data here...}]}
        this.socket.on('events', (data) => {
            data.events.forEach((event) => { this.parseEvent(event); });
        });
    }
}

Hackatron.Game = Game;
