class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
        var collideEnemyHandler = () => {
            if (!this.game.player.character.isAlive) { return; }
            if (this.game.player.character.invincible) { return; }

            this.game.player.kill();

            this.game.fireEvent({key: 'playerKilled', info: {
                player: {id: this.game.player.id}
            }});

            this.game.initDeathScreen();
        };

        if (this.game.enemy) {
            if (this.game.player.character.collisionEnabled) {
                this.game.game.physics.arcade.overlap(this.game.enemy.character.sprite, this.game.player.character.sprite, collideEnemyHandler);
            }
        }
    }
}

export default Component;
