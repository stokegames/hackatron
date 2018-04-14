class Preload {
    constructor(game) {
        this.game = game;
        this.ready = false;
        this.initServerConnection();
    }

    initServerConnection() {
        var wf = document.createElement('script');
        // If we're on port 8082, we're inside the iOS app
        // So we need to tell it to use the local server socket for now
        if (window.location.host.indexOf('8082') !== -1) {
            wf.src = 'http://localhost:8080/socket.io/socket.io.js';
        } else {
            wf.src = '/socket.io/socket.io.js';
        }
        wf.type = 'text/javascript';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    }

    preload() {
        var width = Hackatron.GAME_WIDTH;
        var height = Hackatron.GAME_HEIGHT;
        this.preloaderBar = this.add.sprite(width/4,height/2, 'gfx/overlays/preloader');
        this.preloaderBar.width = width/2;
        this.preloaderBar.anchor.setTo(0, 0);

        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.load.setPreloadSprite(this.preloaderBar);

        var text = this.game.add.text(width/4, height/2-50, "Loading...", {fill: '#ffffff' });
        text.width = width/4;
        this.game.load.onFileComplete.add((progress, cacheKey, success, totalLoaded, totalFiles) => {
            // console.log(progress);
            text.setText("Loading... " + progress + "%");
        }, this);

        this.game.add.plugin(Phaser.Plugin.Tiled);

        var assetsPath = '/Assets/'; //window.location.hostname === 'localhost' ? 'http://localhost:8080/assets/' : 'https://raw.githubusercontent.com/tony-dinh/hackatron/master/assets/';

        // Screens
        this.load.image('ui/screens/launch', assetsPath + 'UI/Screens/launch.png');

        // Effects
        this.load.image('gfx/effects/pellet', assetsPath + 'GFX/Effects/pellet.png');

        // Emitters
        this.load.image('gfx/emitters/blueball', assetsPath + 'GFX/emitters/blueball.png');
        this.load.image('gfx/emitters/brownie', assetsPath + 'GFX/emitters/brownie.png');

        // UI
        this.load.spritesheet('gfx/overlays/countdown', assetsPath + 'GFX/overlays/countdown.png', 29, 27, 3);
        this.load.image('gfx/overlays/gameover', assetsPath + 'GFX/overlays/gameover.png');

        // Buffs
        this.load.atlasJSONHash('gfx/buffs', assetsPath + 'GFX/buffs.png', assetsPath + 'GFX/buffs.json');

        // Blocks
        this.load.spritesheet('gfx/blocks/glitch', assetsPath + 'GFX/blocks/glitch.png', 32, 32, 3);

        // Map
        this.load.pack('map', assetsPath + 'GFX/maps/general.json');

        // Characters
        this.load.atlasJSONHash('gfx/characters', assetsPath + 'GFX/characters.png', assetsPath + 'GFX/characters.json');

        // Audio
        this.load.audio('audio/bg-0002', [assetsPath + 'Audio/bg-0002.mp3']);
    }

    update() {
        if(!!this.ready) {
            Hackatron.ready = true;
            this.game.state.start(Hackatron.screen);
        }
        Hackatron.fitToWindow();
    }

    onLoadComplete() {
        this.ready = true;
    }
}

Hackatron.Preload = Preload;
