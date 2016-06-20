const Framework = require('../../../Framework')
const {React, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Dimensions} = Framework

if (Platform.Env.isNative) {
    // var Button = require('react-native-button')
    // var Actions = require('react-native-router-flux').Actions
    // var CodePush = require('react-native-code-push')
    //var HTTPServer = require('react-native-httpserver')
}


// <View style={styles.container}>
//     <Text>Launch</Text>
//     <FacebookButton />
//     <Button onPress={()=>Actions.login({data:"Custom data", title:'Custom title' })}>Go to Login page</Button>
//     <Button onPress={Actions.register}>Go to Register page</Button>
//     <Button onPress={Actions.register2}>Go to Register page without animation</Button>
//     <Button onPress={()=>Actions.error("Error message")}>Popup error</Button>
//     <Button onPress={Actions.modalBox}>PopUp with ReactNativeModalBox</Button>
//     <Button onPress={Actions.tabbar}>Go to TabBar page</Button>
//     <Button onPress={()=>Actions.showActionSheet({callback:index=>alert("Selected:"+index)})}>Show ActionSheet</Button>
// </View>
class Screen extends Component {
    toString() { '[HomeScreen]' }

    constructor(props) {
        super(props)

        this.state = {}
    }

    componentDidMount() {
        if (Platform.Env.isNative) {
            // HTTPServer.start({port: '8082', root: 'BUNDLE'})
            // fetch('http://localhost:8082/UI/Screens/Launch/Launch.css')
            // .then((data) => {
            //     console.log('Loaded styles:' + data.url)
            //     var styles = Framework.getStyles(data._bodyText, {
            //         header: {
            //             width: Dimensions.get('window').width
            //         },
            //         webView: {
            //             width: Dimensions.get('window').width,
            //             height: Dimensions.get('window').height
            //         }
            //     })
            // 
            //     this.setState({
            //         styles: styles
            //     })
            // })
        }

        Framework.getStyles(Framework.Platform.Env.isServer ? require('fs').readFileSync(__dirname + '/Screen.css').toString() : require('./Screen.css'), 'alcyone-', (styles) => {
            this.setState({
                styles: styles
            })
        })
    }

    render() {
        if (!this.state.styles) { return <div></div> }

        var host = null

        if (Platform.Env.isProduction) {
            host = 'https://stokegames.com'
        } else {
            host = 'http://localhost:8080'
        }

        return Framework.wrapStyles(this.state.styles, 
            <View styles="container">
                {Platform.Env.isNative && (
                    <WebView
                        ref="webviewbridge"
                        styles="web-view"
                        url={host + "/index.html"}
                    />
                )}
            </View>
        )
    }
}

export default Screen
