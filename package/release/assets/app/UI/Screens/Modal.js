'use strict';

var React = require('react-native');
var {View, Text, StyleSheet} = React;
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
