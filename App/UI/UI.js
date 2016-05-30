import StartScreen from './Screens/Start';
import GameScreen from './Screens/Game';

const Framework = require('../Framework');
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework;

var Wrapper;
var config;
// On web, we want a React Look wrapper so we can inject the styles
// On other platforms we will use inline styles, so it isn't necessary
if (Platform.OS === 'web') {
    var reactlook = require('react-look');
    Wrapper = reactlook.LookRoot;
    config = reactlook.Presets['react-dom'];
} else {
    Wrapper = <div></div>;
    config = {};
}

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
            <Wrapper config={config}>
                <div>
                    {this.state.screenKey === 'start' && <StartScreen />}
                    {this.state.screenKey === 'game' && <GameScreen />}
                </div>
            </Wrapper>
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
