import AI from '../Core/AI';

class Component {
    constructor(game) {
        this.game = game;
    }

    run() {
        this.game.ai = new AI();
        this.game.ai.init({game: this.game.engine, player: this.game.player, enemy: this.game.enemy, map: this.game.map});
    }

    init() {
    }
}

export default Component;
