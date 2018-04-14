class Component {
    constructor(game) {
        this.game = game;
        this.game.projectiles = [];
    }

    run(event) {
        var PROJECTILE_SPEED = 400;
        var PROJECTILE_DURATION = 0;

        var projectile = this.game.engine.add.sprite(event.info.x, event.info.y, 'gfx/buffs');
        projectile.owner = event.info.owner;
        projectile.anchor.setTo(0.5);

        if (event.info.characterKey === 'super-saiyan') {
            projectile.animations.add('projectile', ['buffs/blast-attack/1', 'buffs/blast-attack/2', 'buffs/blast-attack/3'], 60, true, true);
            projectile.scale.x = 0.5;
            projectile.scale.y = 0.5;
            // makes block fade away within a 0.2 seconds
            PROJECTILE_DURATION = 200;
        } else if (event.info.characterKey === 'one') {
            projectile.animations.add('projectile', ['buffs/lightning-attack/1', 'buffs/lightning-attack/2', 'buffs/lightning-attack/3', 'buffs/lightning-attack/4', 'buffs/lightning-attack/5', 'buffs/lightning-attack/6'], 90, true, true);
            projectile.scale.x = 0.5;
            projectile.scale.y = 0.5;
            // makes block fade away within a 0.4 seconds
            PROJECTILE_DURATION = 600;
        }

        this.game.engine.physics.arcade.enable(projectile, Phaser.Physics.ARCADE);
        projectile.body.collideWorldBounds = false;
        projectile.body.mass = .9;
        projectile.body.immovable = true;

        projectile.animations.play('projectile');
        this.game.projectiles.push(projectile);

        switch (event.info.direction) {
        case 'walkUp':
            projectile.body.velocity.y = -PROJECTILE_SPEED;
            projectile.angle = -90;
            break;
        case 'walkDown':
            projectile.body.velocity.y = PROJECTILE_SPEED;
            projectile.angle = 90;
            break;
        case 'walkLeft':
            projectile.body.velocity.x = -PROJECTILE_SPEED;
            projectile.angle = 180;
            break;
        case 'walkRight':
            projectile.body.velocity.x = PROJECTILE_SPEED;
            break;
        default:
            break;
        }

        var tween = this.game.engine.add.tween(projectile).to({ alpha: 0 }, PROJECTILE_DURATION, 'Linear', true);
        tween.onComplete.add(function() { tween.stop(); });

        setTimeout(() => {
            if (projectile) {
                this.game.projectiles = this.game.projectiles.filter(function(fb) {
                    return (fb !== projectile);
                });
                projectile.destroy();
            }
        }, PROJECTILE_DURATION);
    }

    update() {
        this.game.projectiles.forEach((projectile, index) => {
            if (projectile.owner !== this.game.player.id) {
                console.log(projectile);
                this.game.engine.physics.arcade.collide(this.game.player.character.sprite, projectile, () => {
                    collideProjectileHandler(index);
                    // Disable projectile physics. TODO: doesn't work
                    // projectile.body.moves = false;
                    // projectile.body.immovable = false;
                });
            }
            if (this.game.enemy) {
                this.game.engine.physics.arcade.collide(this.game.enemy.character.sprite, projectile, () => {
                    // Disable projectile physics. TODO: doesn't work
                    // projectile.body.moves = false;
                    // projectile.body.immovable = false;
                });
            }
        });
    }
}

export default Component;
