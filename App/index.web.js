const Framework = require('./Framework')
const {React, ReactDOM, ReactNative, AppWrapper, AppConfig, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions, Router, Route, Link, browserHistory, Provider, syncHistoryWithStore, routerReducer, renderToString} = Framework

const SiteRouter = require('./Router').default

window.Utils = require('./Game/Core/Utils')

// TODO: Remove this hacky stuff
window.UI_state = {
    screenKey: null
}


const history = syncHistoryWithStore(browserHistory, SiteRouter.store)

class App extends Component {
    toString() { '[App]' }

    constructor(props) {
        super(props)

        // TODO: Remove this hacky stuff
        window.UI_controller = this
        this.state = window.UI_state
    }

    render() {
        return (
            <div>
                <AppWrapper config={AppConfig}>
                    <Provider store={SiteRouter.store}>
                        <div>
                            <Router history={history} routes={SiteRouter.routes} />
                        </div>
                    </Provider>
                </AppWrapper>
            </div>
        )
    }
}



////////////// PHASER GAME

window.Hackatron = {}
Hackatron.ready = false
Hackatron.screen = 'Menu'

require('./Game/States/Boot')
require('./Game/States/Preload')
require('./Game/States/Menu')
require('./Game/States/Game')

if (Utils.env.os.mobile) {
    Hackatron.GAME_WIDTH = 256 // Game originally designed for 512px
    Hackatron.GAME_HEIGHT = 256 * (window.innerHeight / window.innerWidth) // Game originally designed for 512px
} else {
    Hackatron.GAME_WIDTH = 640 // Game originally designed for 640px
    Hackatron.GAME_HEIGHT = 640 // Game originally designed for 640px
}

// Game Constants
Hackatron.UI_WIDTH = Hackatron.GAME_WIDTH // UI originally designed for 700px
Hackatron.UI_HEIGHT = Hackatron.GAME_HEIGHT // UI originally designed for 700px
Hackatron.TILE_COUNT_HORIZONTAL = 40
Hackatron.TILE_COUNT_VERTICAL = 40
Hackatron.GAME_TIME = 5 * 60
Hackatron.DEFAULT_PLAYER_SPEED = 200
Hackatron.POWERUP_SPAWN_INTERVAL = 5000
Hackatron.UPDATE_INTERVAL = 100

var gameContainer = document.getElementById('game')
var uiContainer = document.getElementById('ui')

Hackatron.getWidthGameScale = function() {
    return (window.innerWidth / Hackatron.GAME_WIDTH).toFixed(2)
}

Hackatron.getHeightGameScale = function() {
    return (window.innerHeight / Hackatron.GAME_HEIGHT).toFixed(2)
}

Hackatron.getWidthRatioScale = function() {
    return window.innerHeight > window.innerWidth ? 1 : (window.innerHeight / window.innerWidth).toFixed(2)
}

Hackatron.getHeightRatioScale = function() {
    return window.innerHeight > window.innerWidth ? (window.innerWidth / window.innerHeight).toFixed(2) : 1
}

// Resize UI
window.onresize = function() {
    var smallest = window.innerWidth < window.innerHeight ? window.innerWidth / Hackatron.UI_WIDTH : window.innerHeight / Hackatron.UI_HEIGHT
    uiContainer.style.zoom = smallest
}

// Load Game
Hackatron.debug = window.location.href.indexOf('localhost') !== -1
Hackatron.loader = new Phaser.Game(Hackatron.GAME_WIDTH, Hackatron.GAME_HEIGHT, Phaser.AUTO, gameContainer, null, true)

Hackatron.loader.state.add('Boot', Hackatron.Boot)
Hackatron.loader.state.add('Preload', Hackatron.Preload)
Hackatron.loader.state.add('Menu', Hackatron.Menu)
Hackatron.loader.state.add('Game', Hackatron.Game)

window.onresize()



window.Hackatron.fitToWindow = function() {
    if (window.Hackatron.game) {
        window.Hackatron.game.engine.canvas.style['width'] = '100%'
        window.Hackatron.game.engine.canvas.style['height'] = '100%'
    }
    //this.game.canvas.style['transform'] = 'perspective(900px) rotateX(15deg) rotate(-3deg)'
    document.getElementById('game').style['width'] = Hackatron.getWidthRatioScale() * 100 + '%'
    document.getElementById('game').style['height'] = Hackatron.getHeightRatioScale() * 100 + '%'
    if (Platform.Env.isMobile) {
        document.body.style['background-size'] = 'contain'
    }
    //document.getElementById('ui').style['transform'] = 'perspective(1000px) rotateX(10deg) rotate(-2deg)'
    window.onresize()
}


// Render


ReactDOM.render(<App />, document.getElementById('ui'))

