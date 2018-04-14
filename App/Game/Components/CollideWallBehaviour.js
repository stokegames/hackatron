class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
        var SLIDE_SPEED = this.game.player.character.speed/4;
        var SLIDE_DISTANCE = 5;

        var closestInRangeOf = (params) => {
            var dir = params.range > 0 ? 1 : -1; // are we going backwards?
            var startPos = params.position[params.align];
            var endPos = startPos + params.range;

            for(var i = startPos; i != endPos; i+= dir) {
                var x = params.align === 'x' ? i : params.position.x;
                var y = params.align === 'y' ? i : params.position.y;
                var tile = this.game.getTileAt({x: x, y: y});
                if (!tile || !tile.collides) {
                    return i;
                }
            }

            return null;
        };

        var getNearestOpening = (params) => {
            var align;
            var dir;
            var index;
            var direction = params.direction;
            var position = params.position;

            if (direction === 'walkLeft') { align = 'y'; dir = -1; }
            if (direction === 'walkRight') { align = 'y'; dir = +1; }
            if (direction === 'walkUp') { align = 'x'; dir = -1; }
            if (direction === 'walkDown') { align = 'x'; dir = +1; }

            var seekPositionLeft = {x: Math.floor(position.x), y: Math.floor(position.y)};
            seekPositionLeft[align === 'x' ? 'y' : 'x'] += dir; // get the beside row/column
            seekPositionLeft[align === 'y' ? 'y' : 'x'] -= 1; // get the beside row/column
            var seekPositionRight = {x: Math.floor(position.x), y: Math.floor(position.y)};
            seekPositionRight[align === 'x' ? 'y' : 'x'] += dir; // get the beside row/column
            seekPositionRight[align === 'y' ? 'y' : 'x'] += 1; // get the beside row/column

            var closestLeft = closestInRangeOf({position: seekPositionLeft, align: align, range: -SLIDE_DISTANCE});
            var closestRight = closestInRangeOf({position: seekPositionRight, align: align, range: SLIDE_DISTANCE});

            // must be all blocked
            if (!closestLeft && !closestRight) {
                return;
            }

            var diffLeft = Math.abs(params.position[align] - closestLeft);
            var diffRight = Math.abs(params.position[align] - closestRight);

            return {align: align, left: diffLeft, right: diffRight};
        };

        var collideWallHandler = () => {
            if (!this.game.player.character.direction) {
                return;
            }
            // Find nearest opening and go that way
            // Get current world position
            // Check if direction is up, down, left, or right
            // If direction is up,
            //   check from my position to 0 for the closest opening
            //   check from my position to mapWidth for the closest opening
            // If closest is left, set velocity x = -500
            // If closest is right, set velocity x = 500
            var position = this.game.player.character.worldPosition;
            var direction = this.game.player.character.direction;

            var diff = getNearestOpening({position: position, direction: direction});

            if (!diff) {
                return;
            }

            if (diff.left < diff.right) {
                // going left or up
                this.game.player.character.sprite.body.velocity[diff.align] = -SLIDE_SPEED; // the -SLIDE_SPEED / 5 * diff.left part lets us base the speed we move with how far it is
                //goToPosition = closest * 16 + 8;
            } else if (diff.right < diff.left) {
                // going right or down
                this.game.player.character.sprite.body.velocity[diff.align] = SLIDE_SPEED;
                //goToPosition = closest * 16 - 8;
            } else {
                // He's probably stuck because a few pixels are touching
                // Lets round his position so he's in alignment
                //this.game.player.character.sprite.body.velocity.setTo(0, 0);
                this.game.player.character.position[diff.align] = position[diff.align];
            }
        };

        if (this.game.enemy) {
            //this.game.constrainVelocity(this.game.enemy.character.sprite, 10);
        }

        if (this.game.player.character.collisionEnabled) {
            this.game.map.collideTiles.forEach((tile) => {
                // TODO: Throttle collideWallHandler
                this.game.engine.physics.arcade.collide(this.game.player.character.sprite, tile, collideWallHandler); // tile is an object of Phaser.Sprite
                if (this.game.enemy) {
                    this.game.enemy.character.sprite.body.immovable = false;
                    this.game.engine.physics.arcade.collide(this.game.enemy.character.sprite, tile, () => {
                        // Stop enemy from moving. TODO: doesn't work
                        // this.game.enemy.character.sprite.body.immovable = true;
                        // this.game.enemy.character.sprite.body.velocity.x = 0;
                        // this.game.enemy.character.sprite.body.velocity.y = 0;
                    });
                }
            });
        }

    }
}

export default Component;
