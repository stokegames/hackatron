class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
        if (event.key === 'newPlayer') {
            // If we're this player, we don't need to do anything
            if (this.game.player.id === event.info.player.id) { return; }

            if (this.game.player.id === this.game.hostId) {
                this.welcomePlayer(event.info.player.id);
            }

            var player = this.game.getPlayerById(event.info.player.id);

            if (!player) {
                player = this.game.createPlayer(event.info.player.id);
            }

            player.name = event.info.player.name;
            player.character.position = event.info.player.position;

            console.log('New player ' + event.info.player.id + ' has joined the game!');
        // Set up game state as a new player receiving game data from host
        } else if (event.key === 'welcomePlayer') {
            if (this.game.player.id === event.info.player.id) {
                // Setup players
                event.info.players.forEach((playerInfo) => {
                    var player = this.game.createPlayer(playerInfo.id);
                    player.name = playerInfo.name;
                    if (playerInfo.position) {
                        player.character.position = playerInfo.position;
                    }
                    player.points = playerInfo.points;

                    this.game.players[player.id] = player;
                });

                // Setup enemy
                this.game.enemy = new Enemy();

                this.game.enemy.init({
                    game: this.game.engine,
                    speed: Hackatron.DEFAULT_PLAYER_SPEED,
                    position: event.info.enemy.position
                });

                // Setup powerups
                event.info.powerups.forEach((powerupInfo) => {
                    var powerup = new Powerup();
                    powerup.init({key: powerupInfo.handler.key, game: this.game.engine, map: this.game.map, player: this.game.player, state: powerupInfo.handler.state});
                    powerup.handler.on('destroyed', (params) => { params.positions.forEach((position) => { this.game.powerups[position.x][position.y] = null; }); });

                    this.game.powerups[powerup.handler.state.position.x][powerup.handler.state.position.y] = powerup;
                });

                this.game.gameState = event.info.gameState;
            }
        // Method for handling received deaths of other clients
        } else if (event.key === 'playerKilled') {
            var player = this.game.players[event.info.player.id];

            if (player) {
                player.kill();
            }

            this.game.player.addPoints(100 / this.game.players.length);
            window.UI_GameController.setState(window.GameState);
        // Method for handling player leaves
        } else if (event.key === 'playerLeave') {
            this.game.components['PlayerLeaveBehaviour'].run(event);
        // Method for handling spawned power ups by the host
        } else if (event.key === 'setHost') {
            // If there's currently no host then this is a new game
            // There should be a countdown
            if (!this.game.hostId) {
                this.game.initCountdown();
            }
            // Check if we already know this is the host,
            // And if it's this player, we don't need to set ourselves up again
            if (this.game.hostId === event.info.player.id) { return; }

            this.game.hostId = event.info.player.id;

            // If this player is the new host, lets set them up
            if (this.game.hostId === this.game.player.id) {
                console.log('Hey now the host, lets do this!\n' + this.game.hostId);

                this.game.components['EnemyController'].init();

                if (!this.game.gameState.startTime) {
                    this.game.gameState.startTime = new Date();
                }

                setTimeout(() => {
                    this.game.components['AiController'].run();
                    this.game.components['PowerupController'].run();
                }, 3000);
            }
        }
    }

    welcomePlayer(playerId) {
        // Add players
        var players = [];
        for(playerId in this.game.players) {
            var player = this.game.players[playerId];

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
            id: this.game.player.id,
            name: this.game.player.name,
            position: this.game.player.character.position,
            points: this.game.player.points
        });

        // Add powerups
        var powerups = [];
        for(var row in this.game.powerups) {
            for(var column in this.game.powerups[row]) {
                var powerup = this.game.powerups[row][column];

                if (!powerup) { continue; }

                powerups.push({handler: {key: powerup.handler.key, state: powerup.handler.state}});
            }
        }

        // Compile the game data
        var gameData = {
            player: {id: playerId},
            enemy: {position: this.game.enemy.character.position},
            powerups: powerups,
            players: players,
            gameState: this.game.gameState
        };

        this.game.fireEvent({key: 'welcomePlayer', info: gameData});
    }

    // Method to broadcast to  other clients (if there are any) that you have
    // joined the game
    joinGame() {
        this.game.fireEvent({key: 'newPlayer', info: {
            player: {
                id: this.game.player.id,
                name: this.game.player.name,
                position: this.game.player.character.position
            }
        }});
    }
}

export default Component;
