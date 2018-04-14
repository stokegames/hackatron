const Framework = require('./Framework');
const {React, ReactDOM, ReactNative, AppWrapper, AppConfig, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions, Router, Route, Link, browserHistory, Provider, syncHistoryWithStore, routerReducer, renderToString} = Framework;

console.disableYellowBox = true;

class App extends Component {
    render() {
        return (
            <View></View>
        );
    }
}

AppRegistry.registerComponent('App', () => App);
