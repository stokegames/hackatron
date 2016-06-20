const Framework = require('../Framework');
const {React, ReactDOM, ReactNative, AppWrapper, AppConfig, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions, Router, Route, Link, createStore, browserHistory, Provider, syncHistoryWithStore, routerReducer, combineReducers, renderToString} = Framework;

import {
    TEST_STUFF
} from './Actions';

function site() {
    const isLocal = typeof window !== 'undefined' && window.location.hostname.indexOf('.local') !== -1

    return {
        title: 'Stoke Games',
        description: 'Stoke Games, bringing you games worth being stoked about',
        isLocal: isLocal,
        copyright: {
            date: '2013-' + new Date().getFullYear(),
            company: 'Stoke Games'
        }
    }
}

var reducers = {
    site
};

const rootReducer = combineReducers({
    ...reducers,
    routing: routerReducer
})

export default rootReducer
