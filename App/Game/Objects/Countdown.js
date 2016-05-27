class Countdown {
    init(params) {
        this.game = params.game;
        this.player = params.player;
    }

    start() {
        var centerX = this.game.camera.view.x + this.game.camera.width / 2;
        var centerY = this.game.camera.view.y + this.game.camera.height / 2;
        this.player.character.invincible = true;
        this.player.character.frozen = true;

        // Countdown #3
        var count3 = this.game.add.sprite(centerX, centerY, 'gfx/overlays/countdown');
        count3.frame = 2;
        count3.anchor.setTo(0.5);
        this.game.world.bringToTop(count3);
        var tween3 = this.game.add.tween(count3.scale).to({ x: 3, y: 3}, 600, Phaser.Easing.Exponential.In, true);

        tween3.onComplete.add(() => {
            this.game.add.tween(count3).to( { alpha: 0 }, 200, 'Linear', true);

            // Countdown #2
            var count2 = this.game.add.sprite(centerX, centerY, 'gfx/overlays/countdown');
            count2.frame = 1;
            count2.anchor.setTo(0.5);
            this.game.world.bringToTop(count2);

            var tween2 = this.game.add.tween(count2.scale).to({ x: 3, y: 3}, 600, Phaser.Easing.Exponential.In, true);
            tween2.onComplete.add(() => {
                this.game.add.tween(count2).to( { alpha: 0 }, 200, 'Linear', true);

                // Countdown #1
                var count1 = this.game.add.sprite(centerX, centerY, 'gfx/overlays/countdown');
                count1.frame = 0;
                count1.anchor.setTo(0.5);
                this.game.world.bringToTop(count1);

                var tween1 = this.game.add.tween(count1.scale).to({ x: 3, y: 3}, 600, Phaser.Easing.Exponential.In, true);
                tween1.onComplete.add(() => {
                    this.game.add.tween(count1).to( { alpha: 0 }, 200, 'Linear', true);
                    this.player.character.invincible = false;
                    this.player.character.frozen = false;
                });
            });
        });
    }
}

export default Countdown;
