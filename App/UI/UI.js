import React, {Component} from 'react';
import StartScreen from './Screens/Start';
import GameScreen from './Screens/Game';

// TODO: Remove this hacky stuff
window.UI_state = {
    screenKey: null
};

var UI = React.createClass({
    getInitialState: function() {
        // TODO: Remove this hacky stuff
        window.UI_controller = this;
        return window.UI_state;
    },
    render: function() {
        return (
            <div style={styles.container}>
                {this.state.screenKey === 'start' && <StartScreen />}
                {this.state.screenKey === 'game' && <GameScreen />}
            </div>
        );
    }
});

var styles = {
    container: {
        position: 'relative',
        top: 0,
        left: 0,
        width: '100%'
    }
};

export default UI;
