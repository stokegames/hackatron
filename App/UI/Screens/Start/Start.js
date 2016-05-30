const Framework = require('../../../Framework');
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework;

class StartScreen extends Component {
    toString() { '[StartScreen]' }

    constructor(props) {
        super(props);

        this.state = {
            instantActionTimer: 5,
            styles: Framework.getStyles(require('./Start.css'))
        };
    }

    tick: () => {
        this.setState({instantActionTimer: this.state.instantActionTimer - 1});

        if (this.state.instantActionTimer === 0) {
            clearInterval(this.interval);
            Hackatron.loader.state.start('Game');
        }
    }

    componentDidMount() {
        this.interval = setInterval(this.tick, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    _clickHost() {
        window.UI_state.screenKey = 'hostGame';
        window.UI_controller.setState(window.UI_state);
    }

    _clickJoin() {
        window.UI_state.screenKey = 'joinGame';
        window.UI_controller.setState(window.UI_state);
    }

    _clickInstantAction() {
        Hackatron.loader.state.start('Game');
    }

    render() {
        return Framework.wrapStyles(
            <div styles={this.state.styles.container}>
                <div styles={this.state.styles.instantActionButton} onClick={this._clickInstantAction}>INSTANT ACTION</div>
                <div styles={this.state.styles.countdown}><br />Instant action in... {this.state.instantActionTimer}</div>
            </div>
        );
    }
}

export default StartScreen;
