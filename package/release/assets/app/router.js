'use strict';

import CodePush from 'react-native-code-push';
import React, {Component} from 'react';
import {AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions} from 'react-native';
import Launch from './UI/Screens/Launch';
import Register from './UI/Screens/Register';
import Login from './UI/Screens/Login';
import Login2 from './UI/Screens/Login2';
import Error from './UI/Screens/Error';
import Home from './UI/Screens/Home';
import TabView from './UI/Screens/TabView';
import Modal from './UI/Screens/Modal';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';

var RNRF = require('react-native-router-flux');
var {Route, Schema, Animations, Actions, TabBar} = RNRF;

function reducer(state = {}, action) {
    switch (action.type) {
        case Actions.BEFORE_ROUTE:
            //console.log("BEFORE_ROUTE:", action);
            return state;
        case Actions.AFTER_ROUTE:
            //console.log("AFTER_ROUTE:", action);
            return state;
        case Actions.AFTER_POP:
            //console.log("AFTER_POP:", action);
            return state;
        case Actions.BEFORE_POP:
            //console.log("BEFORE_POP:", action);
            return state;
        case Actions.AFTER_DISMISS:
            //console.log("AFTER_DISMISS:", action);
            return state;
        case Actions.BEFORE_DISMISS:
            //console.log("BEFORE_DISMISS:", action);
            return state;
        default:
            return state;
    }
}

let store = createStore(reducer);
const RouteContainer = connect()(RNRF.Router);

class TabIcon extends Component {
    render() {
        return (
            <Text style={{color: this.props.selected ? 'red' :'black'}}>{this.props.title}</Text>
        );
    }
}

class Header extends Component {
    render() {
        return <Text style={styles.header}></Text>
    }
}

export default class Router extends Component {
    async sync() {
        let self = this;
        try {
            return await CodePush.sync(
                {
                    updateDialog: false,
                    installMode: CodePush.InstallMode.ON_NEXT_RESUME
                },
                (syncStatus) => {
                    switch(syncStatus) {
                        case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                            self.setState({
                                syncMessage: "Checking for update."
                            });
                            break;
                        case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                            self.setState({
                                syncMessage: "Downloading package."
                            });
                            break;
                        case CodePush.SyncStatus.AWAITING_USER_ACTION:
                            self.setState({
                                syncMessage: "Awaiting user action."
                            });
                            break;
                        case CodePush.SyncStatus.INSTALLING_UPDATE:
                            self.setState({
                                syncMessage: "Installing update."
                            });
                            break;
                        case CodePush.SyncStatus.UP_TO_DATE:
                            self.setState({
                                syncMessage: "App up to date.",
                                progress: false
                            });
                            break;
                        case CodePush.SyncStatus.UPDATE_IGNORED:
                            self.setState({
                                syncMessage: "Update cancelled by user.",
                                progress: false
                            });
                            break;
                        case CodePush.SyncStatus.UPDATE_INSTALLED:
                            self.setState({
                                syncMessage: "Update installed and will be run when the app next resumes.",
                                progress: false
                            });
                            break;
                        case CodePush.SyncStatus.UNKNOWN_ERROR:
                            self.setState({
                                syncMessage: "An unknown error occurred.",
                                progress: false
                            });
                            break;
                    }
                },
                (progress) => {
                    self.setState({
                        progress: progress
                    });
                }
            );
        } catch (error) {
            CodePush.log(error);
        }
    }

    componentDidMount() {
        CodePush.notifyApplicationReady();
        this.sync();

        CodePush.checkForUpdate()
        .then((update) => {
            if (!update) {
                console.log("The app is up to date! 2");
            } else {
                console.log("An update is available! Should we download it?");
            }
        });
    }

    render() {
        // Provider is optional (if you want to use redux)
        return (
            <Provider store={store}>
                <RouteContainer hideNavBar={true} key="root">
                    <Route key="launch" header={Header} initial={true} component={Launch} wrapRouter={true} title="Launch" hideNavBar={true}/>
                </RouteContainer>
            </Provider>
        );
    }
}

var styles = StyleSheet.create({
    header: {
        width: Dimensions.get('window').width,
        height: 10,
        backgroundColor: '#000',
        opacity: 0.8,
        color: '#fff'
    }
});
