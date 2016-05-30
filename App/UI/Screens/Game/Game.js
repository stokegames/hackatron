const Framework = require('../../../Framework');
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework;

window.GameState = {
    show: true,
    showOthers: false,
    currentCharacter: 'tron',
    allCharacters: ['tron', 'ghost', 'frosty', 'one'],
    styles: Framework.getStyles(require('./Game.css'))
};

class GameScreen extends Component {
    toString() { '[GameScreen]' }

    constructor(props) {
        super(props);

        window.UI_GameController = this;
        this.state = window.GameState;
    }

    clickCharacter() {
        this.setState({showOthers: !this.state.showOthers});
    }

    changeCharacter(key) {
        this.setState({currentCharacter: key});
        Hackatron.game.player.character.changeSkin(key);
    }

    render() {
        var otherElements = null;

        if (!this.state.show) {
            return <div></div>;
        }

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
                    {players.map(function(item) {
                      return <div key={item.name}>{item.name}: {item.points}</div>;
                    })}
                </div>
            </div>
        );
    }
}

export default GameScreen;
