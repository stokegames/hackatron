const Framework = require('../../../Framework');
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework;

window.GameState = {
    show: true,
    showOthers: false,
    currentCharacter: 'tron',
    allCharacters: ['tron', 'ghost', 'frosty', 'one'],
    styles: Framework.getStyles(require('./Game.css')),
    showMenu: false,
    timeLeft: null
};

class GameScreen extends Component {
    toString() { '[GameScreen]' }

    constructor(props) {
        super(props);

        window.UI_GameController = this;
        this.state = window.GameState;
    }

    clickCharacter() {
        window.GameState.showOthers =  !this.state.showOthers;
        this.setState(window.GameState);
    }

    changeCharacter(key) {
        this.setState({currentCharacter: key});
        Hackatron.game.player.character.changeSkin(key);
    }

    onControlDown(key) {
        Hackatron.game.onControlDown(key);
    }

    onControlUp(key) {
        Hackatron.game.onControlUp(key);
    }

    toggleMenu() {
        window.GameState.showMenu =  !this.state.showMenu;
        this.setState(window.GameState);
    }

    toggleCollisionDebugging() {
        Hackatron.game.collisionDebuggingEnabled = !Hackatron.game.collisionDebuggingEnabled;
    }

    toggleSound() {
        Hackatron.game.soundEnabled = !Hackatron.game.soundEnabled;
    }

    render() {
        var otherElements = null;

        if (this.state.showOthers) {
            var otherCharacters = this.state.allCharacters.slice(0);
            var index = otherCharacters.indexOf(this.state.currentCharacter);
            otherCharacters.splice(index, 1);

            otherElements = <div styles={this.state.styles.otherCharacterChooser}>
                {otherCharacters.map((key) => {
                    return <div style={{width: 32, height: 32, marginBottom: 10, background: 'transparent url(/Assets/GFX/characters/' + key + '/walkDown-0002.png) no-repeat 0 0'}} onClick={()=>this.changeCharacter(key)}></div>;
                })}
            </div>
        }

        var players = [];

        players.push({name: Hackatron.game.player.name, points: Hackatron.game.player.points});
        for (var id in Hackatron.game.players) {
            var player = Hackatron.game.players[id];
            players.push({name: player.name, points: '?'});
        }

        return Framework.wrapStyles(
            <div>
                <div styles={this.state.styles.characterChooser}>
                    <div style={{width: 32, height: 32, background: '#01242C url(/Assets/GFX/characters/' + this.state.currentCharacter + '/walkDown-0002.png) no-repeat 0 0'}} onClick={()=>this.clickCharacter()}></div>
                    {this.state.showOthers && otherElements}
                </div>
                <div styles={this.state.styles.scoreboard}>
                    <div>Time Left: {this.state.timeLeft}</div>
                    {players.map(function(item) {
                        return <div key={item.name}>{item.name}: {item.points}</div>;
                    })}
                </div>
                <div styles={this.state.styles.leftControl} onTouchStart={()=>this.onControlDown('left')} onTouchEnd={()=>this.onControlUp('left')} onMouseDown={()=>this.onControlDown('left')} onMouseUp={()=>this.onControlUp('left')}></div>
                <div styles={this.state.styles.rightControl} onTouchStart={()=>this.onControlDown('right')} onTouchEnd={()=>this.onControlUp('right')} onMouseDown={()=>this.onControlDown('right')} onMouseUp={()=>this.onControlUp('right')}></div>
                <div styles={this.state.styles.topControl} onTouchStart={()=>this.onControlDown('up')} onTouchEnd={()=>this.onControlUp('up')} onMouseDown={()=>this.onControlDown('up')} onMouseUp={()=>this.onControlUp('up')}></div>
                <div styles={this.state.styles.bottomControl} onTouchStart={()=>this.onControlDown('down')} onTouchEnd={()=>this.onControlUp('down')} onMouseDown={()=>this.onControlDown('down')} onMouseUp={()=>this.onControlUp('down')}></div>
                <div styles={this.state.styles.attackControl} onTouchStart={()=>this.onControlDown('att')} onTouchEnd={()=>this.onControlUp('att')} onMouseDown={()=>this.onControlDown('att')} onMouseUp={()=>this.onControlUp('att')}></div>
                <div styles={this.state.styles.menuButton} onClick={()=>this.toggleMenu()}></div>
                {this.state.showMenu && (
                    <div styles={this.state.styles.menu}>
                        <div>Show Debug</div>
                        <div>Toggle AI</div>
                        <div onClick={()=>this.toggleSound()}>Toggle Sound</div>
                        <div onClick={()=>this.toggleCollisionDebugging()}>Toggle Collision Debugging</div>
                        <div>Exit</div>
                    </div>
                )}
            </div>
        );
    }
}

export default GameScreen;
