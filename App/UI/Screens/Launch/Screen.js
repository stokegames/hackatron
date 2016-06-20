const Framework = require('../../../Framework')
const {React, ReactDOM, ReactNative, AppWrapper, AppConfig, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions, Router, Route, Link, browserHistory, Provider, syncHistoryWithStore, routerReducer, renderToString} = Framework

class Screen extends Component {
    toString() { '[Screen]' }

    constructor(props) {
        super(props)

        this.state = {
            instantActionTimer: 5
        }
    }

    tick() {
        this.setState({instantActionTimer: this.state.instantActionTimer - 1})

        if (this.state.instantActionTimer === 0) {
            browserHistory.push('/game')
            Hackatron.loader.state.start('Game')
            clearInterval(this.interval)
        }
    }

    componentDidMount() {
        this.interval = setInterval(this.tick.bind(this), 1000)
        Framework.getStyles(Framework.Platform.Env.isServer ? require('fs').readFileSync(__dirname + '/Screen.css').toString() : require('./Screen.css'), 'alcyone-', (styles) => {
            this.setState({
                styles: styles
            })
        })

        Hackatron.loader.state.start('Boot')
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    clickHost() {
        window.UI_state.screenKey = 'hostGame'
        window.UI_controller.setState(window.UI_state)
    }

    clickJoin() {
        window.UI_state.screenKey = 'joinGame'
        window.UI_controller.setState(window.UI_state)
    }

    clickInstantAction() {
        browserHistory.push('/game')
    }

    render() {
        if (!this.state.styles) { return <View></View> }

        return Framework.wrapStyles(this.state.styles, 
            <View styles="container">
                <View styles="instantActionButton" onClick={()=>this.clickInstantAction()}>INSTANT ACTION</View>
                <View styles="countdown"><br />Instant action in... {this.state.instantActionTimer + ''}</View>
            </View>
        )
    }
}

export default Screen
