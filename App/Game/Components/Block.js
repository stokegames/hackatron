class Block {
    constructor(game) {
        this.game = game;
    }

    run(event) {
        var block = this.game.engine.add.sprite(event.info.x, event.info.y, 'gfx/blocks/glitch');
        block.anchor.setTo(0);
        block.animations.add('glitch', [0,1,2], 12, true, true);
        block.animations.play('glitch');
        this.game.engine.physics.arcade.enable(block, Phaser.Physics.ARCADE);

        block.body.immovable = true;
        block.scale.x = 1;
        block.scale.y = 1;
        this.game.blocks.push(block);

        // Make block fade in 2.0 seconds
        var BLOCK_DURATION = 2000;
        var tween = this.game.engine.add.tween(block).to({ alpha: 0 }, BLOCK_DURATION, 'Linear', true);
        tween.onComplete.add(function() {
            tween.stop();
        });

        // Player can use one less block
        if (event.info.owner === this.game.player.id) {
            this.game.player.blocks++;
        }

        setTimeout(() => {
            this.game.blocks = this.game.blocks.filter(function(b) {
                return (b !== block);
            });
            block.destroy();

            // Player can use one more block
            if (event.info.owner === this.game.player.id) {
                this.game.player.blocks--;
            }
        }, BLOCK_DURATION);

        this.game.blocks.push(block);
    }
}

export default Block;
