import Powerup from '../Objects/Powerup';

class Component {
    constructor(game) {
        this.game = game;
    }

    init() {
        this.game.powerups = [];
        for (var i = 0; i <= Hackatron.TILE_COUNT_VERTICAL; i++) {
            this.game.powerups.push([]);
        }

        this.game.powerupCheckInterval = setInterval(() => {
            this.game.powerups.forEach((_, row) => {
                this.game.powerups[row].forEach((_, column) => {
                    var powerup = this.game.powerups[row][column];
                    if (powerup && powerup.handler.ended) {
                        this.game.powerups[row][column] = null;
                    }
                });
            });
        }, 1000);
    }

    run() {
        var run = () => {
            var powerupHandlers = Object.keys(Powerup.handlers);
            var randomHandler = powerupHandlers[this.game.engine.rnd.integerInRange(0, powerupHandlers.length-1)];
            var powerup = new Powerup();
            powerup.init({key: randomHandler, game: this.game.engine, map: this.game.map, player: this.game.player});
            powerup.handler.on('started', () => { this.game.fireEvent({key: 'foundPowerup', info: {state: powerup.handler.state, player: {id: this.game.player.id}}}); });
            powerup.handler.on('destroyed', (params) => { params.positions.forEach((position) => { this.game.powerups[position.x][position.y] = null; }); });

            this.game.powerups[powerup.handler.state.position.x][powerup.handler.state.position.y] = powerup;

            this.game.fireEvent({key: 'powerupSpawned', info: {handler: {key: randomHandler, state: powerup.handler.state}}});
        };

        this.game.powerupInterval = setInterval(run, Hackatron.POWERUP_SPAWN_INTERVAL);

        run();
    }

    update() {
        this.game.powerups.forEach((row) => {
            row.forEach((powerup) => {
                if (powerup) {
                    powerup.handler.update();
                }
            });
        });
    }
}

export default Component;
