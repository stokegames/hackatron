'use strict';

import React, {Component} from 'react';
import {AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} from 'react-native';
var ReactNativeModalBox = require('../containers/ReactNativeModalBox');

export default class Screen {
    render() {
        return (
            <View>
                {this.props.children}
            </View>
        );
    }
}
