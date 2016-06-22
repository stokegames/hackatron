import Ghost from './Ghost';

class Enemy {
    toString() { '[Enemy]' }

    init(params) {
        params = Object.assign(params, {characterKey: 'ghost', defaultFrameKey: 'walkDown-0002', emitterKey: 'gfx/emitters/brownie'});

        this.character = new Ghost();
        this.character.init(params);

        Object.assign(this, params); // extends this with the params
    }
}

export default Enemy;
