const Framework = require('../Framework');
const {React, ReactDOM, ReactNative, AppWrapper, AppConfig, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions, Router, Route, Link, fetch, createStore, browserHistory, Provider, syncHistoryWithStore, routerReducer, combineReducers, renderToString} = Framework;

export const TEST_STUFF = 'TEST_STUFF'

export function testStuff(thing) {
    return {
        type: TEST_STUFF,
        thing
    }
}
