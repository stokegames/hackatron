const Framework = require('./Framework');
const {React, ReactDOM, ReactNative, AppWrapper, AppConfig, Platform, Component, AppRegistry, Navigator, StyleSheet, Text, View, TouchableHighlight, WebView, Animated, Dimensions, Router, Route, Link, browserHistory, Provider, syncHistoryWithStore, routerReducer, renderToString} = Framework;

import SiteRouter from './Router';

console.disableYellowBox = true;


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

const CodePush = require('react-native-code-push')
const EStyleSheet = require('react-native-extended-stylesheet')

// calculate styles
EStyleSheet.build();

const RNRF = require('react-native-router-flux');

RouteContainer = connect()(RNRF.Router)

class App extends Component {
    async sync() {
        try {
            return await CodePush.sync({
                updateDialog: false,
                installMode: CodePush.InstallMode.ON_NEXT_RESUME
            }, (syncStatus) => {
                switch(syncStatus) {
                    case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                        this.setState({
                            syncMessage: "Checking for update."
                        });
                        break;
                    case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                        this.setState({
                            syncMessage: "Downloading package."
                        });
                        break;
                    case CodePush.SyncStatus.AWAITING_USER_ACTION:
                        this.setState({
                            syncMessage: "Awaiting user action."
                        });
                        break;
                    case CodePush.SyncStatus.INSTALLING_UPDATE:
                        this.setState({
                            syncMessage: "Installing update."
                        });
                        break;
                    case CodePush.SyncStatus.UP_TO_DATE:
                        this.setState({
                            syncMessage: "App up to date.",
                            progress: false
                        });
                        break;
                    case CodePush.SyncStatus.UPDATE_IGNORED:
                        this.setState({
                            syncMessage: "Update cancelled by user.",
                            progress: false
                        });
                        break;
                    case CodePush.SyncStatus.UPDATE_INSTALLED:
                        this.setState({
                            syncMessage: "Update installed and will be run when the app next resumes.",
                            progress: false
                        });
                        break;
                    case CodePush.SyncStatus.UNKNOWN_ERROR:
                        this.setState({
                            syncMessage: "An unknown error occurred.",
                            progress: false
                        });
                        break;
                }
            }, (progress) => {
                this.setState({
                    progress: progress
                });
            });
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
        return (
            <Provider store={SiteRouter.store}>
                <RouteContainer hideNavBar={true} key="root">
                    {SiteRouter.routes}
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

AppRegistry.registerComponent('App', () => App);
