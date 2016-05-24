'use strict';

import React, {Component} from 'react';
import {AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions} from 'react-native';
import Router from './router';

console.disableYellowBox = true;

AppRegistry.registerComponent('Router', () => Router);
