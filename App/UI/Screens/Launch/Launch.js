'use strict';

const Framework = require('../../../Framework');
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView} = Framework;

if (Platform.OS === 'ios') {
    var Button = require('react-native-button');
    var Actions = require('react-native-router-flux').Actions;
    var CodePush = require('react-native-code-push');
    var HTTPServer = require('react-native-httpserver');
    var Dimensions = require('Dimensions');
}


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
class Launch extends Component {
    toString() { '[Launch]' }

    version() {
        console.log('1.2.2.4');
    }

    constructor(props) {
        super(props);

        this.state = {
            styles: {}
        };
    }

    componentWillMount() {
    }

    componentDidMount() {
        if (Platform.OS === 'ios') {
            HTTPServer.start({port: '8082', root: 'BUNDLE'});
            fetch('http://localhost:8082/UI/Screens/Launch/Launch.css')
            .then((data) => {
                console.log('Loaded styles:' + data.url);
                var styles = Framework.getStyles(data._bodyText, {
                    header: {
                        width: Dimensions.get('window').width
                    },
                    webView: {
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height
                    }
                });

                this.setState({
                    styles: styles
                });
            });
        }
    }

    render() {
        var host = null;
        var isProd = false;

        if (isProd) {
            host = 'http://localhost:8082';
        } else {
            host = 'http://localhost:8080';
        }

        return Framework.wrapStyles(
            <View styles={this.state.styles.container}>
                {Platform.OS === 'ios' && (
                    <WebView
                        ref="webviewbridge"
                        styles={this.state.styles.webView}
                        url={host + "/index.html"}
                    />
                )}
                {Platform.OS === 'web' && (
                    <WebView
                        ref="webviewbridge"
                        styles={this.state.styles.webView}
                        url={host + "/index.html"}
                    />
                )}
            </View>
        );
    }
}

module.exports = Launch;
