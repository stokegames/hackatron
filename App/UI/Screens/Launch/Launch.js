'use strict';

import React, {Component} from 'react';
import {AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} from 'react-native';
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;

import Dimensions from 'Dimensions';
import CodePush from 'react-native-code-push';

var HTTPServer = require('react-native-httpserver');

// <View style={styles.container}>
//     <Text>Launch page</Text>
//     <FacebookButton />
//     <Button onPress={()=>Actions.login({data:"Custom data", title:'Custom title' })}>Go to Login page</Button>
//     <Button onPress={Actions.register}>Go to Register page</Button>
//     <Button onPress={Actions.register2}>Go to Register page without animation</Button>
//     <Button onPress={()=>Actions.error("Error message")}>Popup error</Button>
//     <Button onPress={Actions.modalBox}>PopUp with ReactNativeModalBox</Button>
//     <Button onPress={Actions.tabbar}>Go to TabBar page</Button>
//     <Button onPress={()=>Actions.showActionSheet({callback:index=>alert("Selected:"+index)})}>Show ActionSheet</Button>
// </View>
class Launch extends React.Component {
    version() {
        console.log('1.2.2.4');
    }

    componentDidMount() {
        HTTPServer.start({port: '8082', root: 'BUNDLE'});
    }

    render() {
        return (
            <View style={styles.container}>
                <WebView
                    ref="webviewbridge"
                    style={styles.webView}
                    url={"http://127.0.0.1:8082/index.html"}
                />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        color: '#fff',
        backgroundColor: '#000',
        padding: 10,
        opacity: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 0
    },
    webView: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
});

module.exports = Launch;
