class Boot {
    constructor(game) {
        this.game = game
    }

    preload() {
        // enable crisp rendering
        this.game.renderer.renderSession.roundPixels = true
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas)

        var assetsPath = '/Assets/'
        this.load.image('gfx/overlays/preloader',  assetsPath + 'GFX/overlays/preloader.gif')

        Hackatron.fitToWindow()
    }

    create() {
        this.game.state.start('Preload')
    }
}

Hackatron.Boot = Boot
