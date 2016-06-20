const Framework = require('./Framework');
const {React, ReactDOM, ReactNative, AppWrapper, AppConfig, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions, Router, Route, Link, createStore, browserHistory, Provider, syncHistoryWithStore, routerReducer, renderToString} = Framework;

import {createDevTools} from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'
import {HotKeys} from 'react-hotkeys'
import configureStore from './Game/Store'

var routes = null
var store = null

if (Platform.Env.isNative) {
    function reducer(state = {}, action) {
        switch (action.type) {
            case RNRF.Actions.BEFORE_ROUTE:
                //console.log("BEFORE_ROUTE:", action);
                return state;
            case RNRF.Actions.AFTER_ROUTE:
                //console.log("AFTER_ROUTE:", action);
                return state;
            case RNRF.Actions.AFTER_POP:
                //console.log("AFTER_POP:", action);
                return state;
            case RNRF.Actions.BEFORE_POP:
                //console.log("BEFORE_POP:", action);
                return state;
            case RNRF.Actions.AFTER_DISMISS:
                //console.log("AFTER_DISMISS:", action);
                return state;
            case RNRF.Actions.BEFORE_DISMISS:
                //console.log("BEFORE_DISMISS:", action);
                return state;
            default:
                return state;
        }
    }

    routes = <Route key="launch" header={Header} initial={true} component={LaunchScreen} wrapRouter={true} title="Launch Screen" hideNavBar={true} />
    store = createStore(reducer);
} else {
    // Polyfill for nodejs /w babel
    if (typeof require.ensure !== "function") require.ensure = function(d, c) { c(require) };
    if (typeof require.include !== "function") require.include = function() {};


    const DevTools = createDevTools(
        <DockMonitor
            toggleVisibilityKey='ctrl-h'
            changePositionKey='ctrl-q'
            changeMonitorKey='ctrl-m'
            defaultIsVisible={false}>
            <LogMonitor theme="tomorrow" preserveScrollTop={false} />
        </DockMonitor>
    )

    store = configureStore(DevTools.instrument())

    class Toolbar extends React.Component {
        render() {
            return (
                <ul style={{
                        position: 'fixed',
                        left: '0',
                        top: '0',
                        height: '100%',
                        width: '20%',
                        background: '#000',
                        color: '#fff',
                        zIndex: 100
                    }}>
                    <li>
                        <a href="http://hackatron.rocks.local:10020/">Go to Hackatron</a>
                    </li>
                    <li>
                        <a href="http://ttt.stokegames.com.local:10010/">Go to TTT</a>
                    </li>
                </ul>
            );
        }
    }

    class RealRouter extends Component {
        constructor(props) {
            super(props)

            this.toggleToolbar = this.toggleToolbar.bind(this)

            this.state = {
                toolbarActive: false
            }
        }

        toggleToolbar() {
            console.log('toggleToolbar')

            this.setState({
                toolbarActive: !this.state.toolbarActive
            })
        }

        render() {
            const handlers = {
                'toggleToolbar': this.toggleToolbar
            };

            const map = {
                'toggleToolbar': 'ctrl+n'
            };

            const isLocal = typeof window !== 'undefined' && window.location.hostname.indexOf('.local') !== -1

            return (
                <div>
                    <HotKeys handlers={handlers} keyMap={map}>
                        <div>
                            {this.props.children}
                            {isLocal && <DevTools />}
                            {isLocal && this.state.toolbarActive && <Toolbar />}
                        </div>
                    </HotKeys>
                </div>
            );
        }
    }

    const onEnterHome = function(nextState, replace) {
        replace({
            pathname: '/launch',
            state: { nextPathname: nextState.location.pathname }
        })
    }

    routes = {
        component: RealRouter,
        childRoutes: [
            {path: '/', onEnter: onEnterHome},
            {path: '/launch', getComponent: (nextState, cb) => { cb(null, require('./UI/Screens/Launch/Screen').default); } },
            {path: '/game', getComponent: (nextState, cb) => { cb(null, require('./UI/Screens/Game').default); } },
        ]
    }
}

export default {
    routes: routes,
    store: store
}