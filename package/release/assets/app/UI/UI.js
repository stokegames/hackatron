import React, {Component} from 'react';
import StartScreen from './Screens/StartScreen';
import IngameScreen from './Screens/IngameScreen';

window.UI_state = {
    screenKey: null
};

var UI = React.createClass({
  getInitialState: function() {
    window.UI_controller = this;
    return window.UI_state;
  },
  render: function() {
    return (
      <div style={styles.container}>
        {this.state.screenKey === 'start' && <StartScreen />}
        {this.state.screenKey === 'ingame' && <IngameScreen />}
      </div>
    );
  }
});

var styles = {
    container: {
      position: 'relative',
      top: 0,
      left: 0
    }
};

export default UI;
