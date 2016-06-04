class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
    }

    init() {
        this.game.game.plugins.cameraShake.shake();

        this.game.enemy.character.worldPosition = this.game.getValidPosition();
        this.game.enemy.character.frozen = true;

        // var death = new Gameover();
        // death.init(this.game.game);
        // death.start();

        this.game.player.removePoints(100);

        for(var id in this.game.players) {
            this.game.players[id].addPoints(100 / this.game.players.length);
        }

        window.UI_GameController.setState(window.GameState);

        this.game.newGameKey = this.game.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.game.newGameKey.onDown.add(() => {
            // Remove death screen

            this.game.newGameKey.onDown.remove();
        });

        setTimeout(() => {
            //death.sprite.destroy();
            this.game.player.character.worldPosition = this.game.getValidPosition();
            this.game.player.character.revive();

            setTimeout(() => {
                this.game.enemy.character.frozen = false;
            }, 1000);
        }, 2000);
    }
}

export default Component;
