class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
        if (!Utils.env.os.desktop) { return }

        if (!this.game.engine.input.mousePointer.isDown) {
            return;
        }

        // top = -1.25
        // bottom = 1
        // left = 2.5
        // right = 0
        // http://phaser.io/examples/v2/arcade-physics/angle-to-pointer
        var angle = this.game.engine.physics.arcade.angleToPointer(this.game.player.character.sprite) * (180/Math.PI);

        this.game.player.character.moving.up = false;
        this.game.player.character.moving.down = false;
        this.game.player.character.moving.left = false;
        this.game.player.character.moving.right = false;

        // right
        if (Math.abs(angle) > 0 && Math.abs(angle) <= 45) {
            this.game.player.character.moving.right = true;
        }
        // left
        else if (Math.abs(angle) > 135 && Math.abs(angle) <= 180) {
            this.game.player.character.moving.left = true;
        }
        // up
        else if (Math.abs(angle) > 45 && Math.abs(angle) <= 135 && angle < 0) {
            this.game.player.character.moving.up = true;
        }
        // down
        else if (Math.abs(angle) > 45 && Math.abs(angle) <= 135 && angle > 0) {
            this.game.player.character.moving.down = true;
        }
        //  if it's overlapping the mouse, don't move any more
        // if (Phaser.Rectangle.contains(this.game.player.character.sprite.body, this.game.engine.input.x, this.game.engine.input.y)) {
        //     this.game.player.character.sprite.body.velocity.x = 0;
        //     this.game.player.character.sprite.body.velocity.y = 0;
        // }
    }

}

export default Component;
