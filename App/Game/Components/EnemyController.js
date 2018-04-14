import Enemy from '../Objects/Enemy';

class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
    }

    init() {
        // Create enemy for the host
        if (!this.game.enemy) {
            var worldPosition = this.game.getValidPosition();

            this.game.enemy = new Enemy();
            this.game.enemy.init({
                game: this.game.engine,
                speed: Hackatron.DEFAULT_PLAYER_SPEED,
                worldPosition: worldPosition,
                keys: { // TODO: Could be architected better
                    up: Phaser.Keyboard.W,
                    down: Phaser.Keyboard.S,
                    left: Phaser.Keyboard.A,
                    right: Phaser.Keyboard.D
                }
            });
        }

        // If this is the host
        // Send enemy position every 50ms
        this.game.enemyInterval = setInterval(() => {
            if (this.game.enemy && this.game.player.id === this.game.hostId) {
                //this.game.enemy.character.updatePos();

                if (!this.game.enemy.character.dirty) { return; }

                this.game.enemy.character.dirty = false;

                var info = {
                    owner: this.game.player.id,
                    position: this.game.enemy.character.position,
                    direction: this.game.enemy.character.direction
                };

                this.game.fireEvent({key: 'updateEnemy', info: info});
            }
        }, Hackatron.UPDATE_INTERVAL);
    }
}

export default Component;
