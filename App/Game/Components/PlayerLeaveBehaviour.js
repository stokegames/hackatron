class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
        if (this.game.players[event.info.player.id]) {
            var player = this.game.players[event.info.player.id];
            player.kill();

            delete this.game.players[event.info.player.id];
        }
    }
}

export default Component;
