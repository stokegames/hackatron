import StartScreen from './Screens/Start';
import GameScreen from './Screens/Game';

const Framework = require('../Framework');
const {React, AppWrapper, AppConfig, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework;


// TODO: Remove this hacky stuff
window.UI_state = {
    screenKey: null
};

class UI extends Component {
    toString() { '[UI]' }

    constructor(props) {
        super(props);

        // TODO: Remove this hacky stuff
        window.UI_controller = this;
        this.state = window.UI_state;
    }

    render() {
        return (
            <AppWrapper config={AppConfig}>
                <div>
                    {this.state.screenKey === 'start' && <StartScreen />}
                    {this.state.screenKey === 'game' && <GameScreen />}
                </div>
            </AppWrapper>
        );
    }
}

var styles = {
    container: {
        position: 'relative',
        top: 0,
        left: 0,
        width: '100%'
    }
};

export default UI;
