const Framework = require('../../../Framework')
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework

class Screen extends Component {
    toString() { '[GameScreen]' }

    constructor(props) {
        super(props)

        if (typeof window !== 'undefined' && window.GameState) {
            window.UI_GameController = this
            this.state = window.GameState
        } else {
            this.state = {}
        }
    }

    clickCharacter() {
        window.GameState.showOthers =  !this.state.showOthers
        this.setState(window.GameState)
    }

    changeCharacter(key) {
        this.setState({currentCharacter: key})
        Hackatron.game.player.character.changeSkin(key)
    }

    onControlDown(key) {
        Hackatron.game.onControlDown(key)
    }

    onControlUp(key) {
        Hackatron.game.onControlUp(key)
    }

    toggleMenu() {
        window.GameState.showMenu = !this.state.showMenu
        this.setState(window.GameState)
    }

    toggleCollisionDebugging() {
        Hackatron.game.collisionDebuggingEnabled = !Hackatron.game.collisionDebuggingEnabled
    }

    toggleSound() {
        Hackatron.game.engine.music.mute = !Hackatron.game.engine.music.mute
    }

    componentDidMount() {
        Framework.getStyles(Framework.Platform.Env.isServer ? require('fs').readFileSync(__dirname + '/Screen.css').toString() : require('./Screen.css'), 'alcyone-', (styles) => {
            if (typeof window !== 'undefined') {
                window.GameState.styles = styles
                this.setState(window.GameState)
            }
        })

        Hackatron.screen = 'Game'

        if (Hackatron.ready) {
            Hackatron.loader.state.start('Game')
        } else {
            Hackatron.loader.state.start('Boot')
        }
    }

    render() {
        if (!this.state.styles || !Hackatron.game || !Hackatron.game.player) { return <View></View> }

        var otherElements = null

        if (this.state.showOthers) {
            var otherCharacters = this.state.allCharacters.slice(0)
            var index = otherCharacters.indexOf(this.state.currentCharacter)
            otherCharacters.splice(index, 1)

            otherElements = (
                <View styles="c-other-character-chooser">
                    {otherCharacters.map((key) => {
                        return <View style={{width: 32, height: 32, marginBottom: 10, background: 'transparent url(/Assets/GFX/characters/' + key + '/walkDown-0002.png) no-repeat 0 0'}} onClick={()=>this.changeCharacter(key)}></View>
                    })}
                </View>
            )
        }

        var players = []

        players.push({name: Hackatron.game.player.name, points: Hackatron.game.player.points})
        for (var id in Hackatron.game.players) {
            var player = Hackatron.game.players[id]
            players.push({name: player.name, points: '?'})
        }

        return Framework.wrapStyles(this.state.styles, 
            <View>
                <View styles="c-character-chooser">
                    <View style={{width: 32, height: 32, background: '#01242C url(/Assets/GFX/characters/' + this.state.currentCharacter + '/walkDown-0002.png) no-repeat 0 0'}} onClick={()=>this.clickCharacter()}></View>
                    {this.state.showOthers && otherElements}
                </View>
                <View styles="c-scoreboard">
                    <View>Time Left: {this.state.timeLeft}</View>
                    {players.map((item) => <View key={item.name}>{item.name}: {item.points}</View>)}
                </View>
                <View styles="c-left-control" onTouchStart={()=>this.onControlDown('left')} onTouchEnd={()=>this.onControlUp('left')} onMouseDown={()=>this.onControlDown('left')} onMouseUp={()=>this.onControlUp('left')}></View>
                <View styles="c-right-control" onTouchStart={()=>this.onControlDown('right')} onTouchEnd={()=>this.onControlUp('right')} onMouseDown={()=>this.onControlDown('right')} onMouseUp={()=>this.onControlUp('right')}></View>
                <View styles="c-top-control" onTouchStart={()=>this.onControlDown('up')} onTouchEnd={()=>this.onControlUp('up')} onMouseDown={()=>this.onControlDown('up')} onMouseUp={()=>this.onControlUp('up')}></View>
                <View styles="c-bottom-control" onTouchStart={()=>this.onControlDown('down')} onTouchEnd={()=>this.onControlUp('down')} onMouseDown={()=>this.onControlDown('down')} onMouseUp={()=>this.onControlUp('down')}></View>
                <View styles="c-attack-control" onTouchStart={()=>this.onControlDown('att')} onTouchEnd={()=>this.onControlUp('att')} onMouseDown={()=>this.onControlDown('att')} onMouseUp={()=>this.onControlUp('att')}></View>
                <View styles="c-menu-button" onClick={()=>this.toggleMenu()}></View>
                {this.state.showMenu && (
                    <View styles="c-menu">
                        <View>Show Debug</View>
                        <View>Toggle AI</View>
                        <View onClick={()=>this.toggleSound()}>Toggle Sound</View>
                        <View onClick={()=>this.toggleCollisionDebugging()}>Toggle Collision Debugging</View>
                        <View>Exit</View>
                    </View>
                )}
            </View>
        )
    }
}

export default Screen
