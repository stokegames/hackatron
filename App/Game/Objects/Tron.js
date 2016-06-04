import Character from './Character';

class Tron extends Character {
    toString() { '[Tron]' }

    init(params) {
        params = Object.assign(params, {characterKey: 'tron', defaultFrameKey: 'walkDown-0002', emitterKey: 'gfx/emitters/blueball'});

        super.init(params);

        this.blocks = 3;
        this.frozen = false;
        this.invincible = false;
        this.teleported = false;
    }

    eatPellet(pellet) {
        this.addPoints(pellet.getPoints());
        pellet.eaten();
    }

    triggerAttack() {
        if (!this.isAlive) { return null; }

        if (this.characterKey === 'super-saiyan'
        || this.characterKey === 'one') {
            Hackatron.game.fireEvent({
                key: 'projectileFired',
                info: {
                    owner: this.id,
                    x: this.sprite.x,
                    y: this.sprite.y,
                    direction: this.direction,
                    characterKey: this.characterKey
                }
            });

            return;
        }

        if (this.blocks > 0) {
            var blockPosition = Utils.flooredPosition(this.sprite.position);
            blockPosition.x -= 8;
            blockPosition.y -= 8;

            // Make sure blocks stay within outer world wall
            if (blockPosition.x + 32 >= (Hackatron.TILE_COUNT_HORIZONTAL - 1) * 16) {
                blockPosition.x -= 16;
            }
            if (blockPosition.y + 32 >= (Hackatron.TILE_COUNT_VERTICAL - 1) * 16) {
                blockPosition.y -= 16;
            }

            Hackatron.game.fireEvent({
                key: 'blockSpawned',
                info: {
                    x: blockPosition.x,
                    y: blockPosition.y,
                    owner: this.id
                }
            });
        }
    }

    teleport(destination) {
        if (this.teleported) { return; }

        console.log('Teleporting player to...', destination);
        this.worldPosition = destination;
        this.teleported = true;

        setTimeout(() => { this.teleported = false; }, 2000);
    }
}

export default Tron;
