class Menu {
    constructor(game) {
        this.game = game;
    }

    create() {
        if (Hackatron.debug) {
            //this.game.add.plugin(Phaser.Plugin.Debug);
        }

        window.document.body.style['background'] = '#000 url(/Assets/UI/Screens/launch.png) no-repeat 0 0'
        window.document.body.style['background-size'] = 'cover'

        // @media (min-width: 450px) {
        //     background-size: auto 75%;
        // }

        //this.stage.setBackgroundColor(0x000000);
        // var bg = this.add.sprite(0, 0, 'ui/screens/launch');
        // var ratio = bg.height / bg.width;
        // bg.width = Hackatron.GAME_WIDTH;
        // bg.height = bg.width * ratio;
        //bg.y = (window.innerHeight - bg.height) / 4;

        this.startKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.musicKey = this.input.keyboard.addKey(Phaser.Keyboard.M);

        window.UI_state.screenKey = 'start';
        window.UI_controller.setState(window.UI_state);

        this.game.music = this.game.add.audio('audio/bg-0002', 1, true);
        this.game.music.play('', 0, 1, true);
        this.game.music.mute = true;
    }

    update() {
        if (this.startKey.isDown) {
            this.game.state.start('Game');
        }

        if (this.musicKey.isDown) {
            this.game.music.mute = !this.game.music.mute;
        }

        Hackatron.fitToWindow();
    }
}

Hackatron.Menu = Menu;
