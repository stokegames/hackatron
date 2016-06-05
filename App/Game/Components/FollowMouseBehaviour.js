class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
        if (!this.game.engine.input.mousePointer.isDown) { return; }

        // top = -1.25
        // bottom = 1
        // left = 2.5
        // right = 0
        // http://phaser.io/examples/v2/arcade-physics/angle-to-pointer
        var angle = this.game.engine.physics.arcade.angleToPointer(this.game.player.character.sprite) * (180/Math.PI);

        // right
        if (Math.abs(angle) > 0 && Math.abs(angle) <= 45) {
            this.game.player.character.inputRight = true;
        }
        // left
        if (Math.abs(angle) > 135 && Math.abs(angle) <= 180) {
            this.game.player.character.inputLeft = true;
        }
        // up
        if (Math.abs(angle) > 45 && Math.abs(angle) <= 135 && angle < 0) {
            this.game.player.character.inputUp = true;
        }
        // down
        if (Math.abs(angle) > 45 && Math.abs(angle) <= 135 && angle > 0) {
            this.game.player.character.inputDown = true;
        }

        //  if it's overlapping the mouse, don't move any more
        // if (Phaser.Rectangle.contains(this.game.player.character.sprite.body, this.game.engine.input.x, this.game.engine.input.y)) {
        //     this.game.player.character.sprite.body.velocity.x = 0;
        //     this.game.player.character.sprite.body.velocity.y = 0;
        // }
    }

}

export default Component;
