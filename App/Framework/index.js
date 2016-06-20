import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {Router, Route, Link, browserHistory} from 'react-router'
import {Provider, connect} from 'react-redux'
import {syncHistoryWithStore, routerReducer} from 'react-router-redux'

import fetch from 'isomorphic-fetch'


if (typeof GLOBAL !== 'undefined' && GLOBAL.Framework) {
    module.exports = GLOBAL.Framework
} else {
    var Framework = {};

    //===============

    var React = require('react');

    Framework.React = React;
    Framework.Component = React.Component;
    Framework.PropTypes = React.PropTypes;

    //===============

    if (typeof process.argv !== 'undefined') {
        var argv = require('minimist')(process.argv.slice(2));

        Framework.Platform = {
            OS: argv.platform ? argv.platform : 'web',
            Env: {
                isNative: false,
                isServer: typeof window === 'undefined' ? true : false,
                isMobile: false,
                isTablet: false,
                isDesktop: false,
                isRetina: false,
                isProduction: process.env.NODE_ENV === 'production'
            }
        };

        Framework.StyleSheet = {
            create: function(styles) {
                return styles;
            }
        };

        Framework.View = React.createClass({
            displayName: 'View',

            render: function render() {
                return React.createElement(
                    'div',
                    this.props,
                    this.props.children
                );
            }
        });

        Framework.Text = React.createClass({
            displayName: 'Text',

            render: function render() {
                return React.createElement(
                    'div',
                    this.props,
                    this.props.children
                );
            }
        });

        Framework.Img = React.createClass({
            displayName: 'Img',

            render: function render() {
                return React.createElement(
                    'img',
                    this.props
                );
            }
        });
        
        const {renderToString} = require('react-dom/server')

        Framework.renderToString = renderToString
    } else {
        var ReactNative = require('react-native');

        Framework.ReactNative = ReactNative;
        Framework.Platform = ReactNative.Platform;
        Framework.ReactNative = ReactNative.ReactNative;
        Framework.AppRegistry = ReactNative.AppRegistry;
        Framework.Navigator = ReactNative.Navigator;
        Framework.StyleSheet = ReactNative.StyleSheet;
        Framework.Text = ReactNative.Text;
        Framework.View = ReactNative.View;
        Framework.TouchableHighlight = ReactNative.TouchableHighlight;
        Framework.WebView = ReactNative.WebView;
        Framework.Animated = ReactNative.Animated;
        Framework.Dimensions = ReactNative.Dimensions;

        Framework.Platform.Env = {
            isNative: true,
            isServer: false,
            isMobile: false,
            isTablet: false,
            isRetina: false,
            isProduction: process.env.NODE_ENV === 'production'
        }
        
        Framework.renderToString = function() { throw 'Wrong context for renderToString' }
    }

    //===============

    console.log('On platform: ' + Framework.Platform.OS + '(Server: ' + Framework.Platform.Env.isServer + ')')

    if (Framework.Platform.OS === 'web') {
        Framework.ReactDOM = require('react-dom');

        var _parseVersion = function(version) {
            if (!version) return {};

            var parts = version.split('.');

            return {
                version: version,
                major: parseInt(parts[0] || 0),
                minor: parseInt(parts[1] || 0),
                patch: parseInt(parts[2] || 0)
            };
        };

        var device;
        // This ratio is less than 1 because it accommodates when keyboards are activated.
        var compareRatio = 0.8;

        /*jshint maxstatements:120 */
        var detect = function(ua) {
            var browserVersion;
            var osVersion;
            var os = {};
            var browser = {};
            var cssClasses = [];

            var webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/);
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var osx = !!ua.match(/\(Macintosh\; Intel /);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
            var windowsphone = ua.match(/Windows Phone ([\d.]+)/);
            var kindle = ua.match(/Kindle\/([\d.]+)/);
            var silk = ua.match(/Silk\/([\d._]+)/);
            var blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
            var bb10 = ua.match(/(BB10).*Version\/([\d.]+)/);
            var rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/);
            var playbook = ua.match(/PlayBook/);
            var chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/);
            var firefox = ua.match(/Firefox\/([\d.]+)/);
            var ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/);
            var webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/);
            var safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/);

            browser.webkit = !!webkit;

            if (browser.webkit) {
                browserVersion = webkit[1];
                cssClasses.push('webkit');
            }

            if (android) {
                os.android = true;
                osVersion = android[2];
                cssClasses.push('android');
            }
            if (iphone && !ipod) {
                os.ios = os.iphone = true;
                osVersion = iphone[2].replace(/_/g, '.');
                cssClasses.push('ios', 'iphone');
            }
            if (ipad) {
                os.ios = os.ipad = true;
                osVersion = ipad[2].replace(/_/g, '.');
                cssClasses.push('ios', 'ipad');
            }
            if (ipod) {
                os.ios = os.ipod = true;
                osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
                cssClasses.push('ios', 'ipod');
            }
            if (windowsphone) {
                os.windowsphone = true;
                osVersion = windowsphone[1];
                cssClasses.push('windows');
            }
            if (blackberry) {
                os.blackberry = true;
                osVersion = blackberry[2];
                cssClasses.push('blackberry');
            }
            if (bb10) {
                os.bb10 = true;
                osVersion = bb10[2];
                cssClasses.push('blackberry', 'bb10');
            }
            if (rimtabletos) {
                os.rimtabletos = true;
                osVersion = rimtabletos[2];
                cssClasses.push('blackberry');
            }
            if (playbook) {
                browser.playbook = true;
                cssClasses.push('playbook');
            }
            if (kindle) {
                os.kindle = true;
                osVersion = kindle[1];
                cssClasses.push('kindle');
            }
            if (silk) {
                browser.silk = true;
                browserVersion = silk[1];
                cssClasses.push('silk');
            }
            if (!silk && os.android && ua.match(/Kindle Fire/)) {
                browser.silk = true;
                cssClasses.push('silk');
            }
            if (chrome) {
                browser.chrome = true;
                browserVersion = chrome[1];
                cssClasses.push('chrome');
            }
            if (firefox) {
                browser.firefox = true;
                browserVersion = firefox[1];
                cssClasses.push('firefox');
            }
            if (ie) {
                browser.ie = true;
                browserVersion = ie[1];
                cssClasses.push('ie');
            }
            if (safari && (osx || os.ios)) {
                browser.safari = true;
                cssClasses.push('safari');
                if (osx) {
                    browserVersion = safari[1];
                }
            }

            if (webview) {
                browser.webview = true;
                cssClasses.push('webview');
            }

            os = Object.assign({}, os, _parseVersion(osVersion));
            browser = Object.assign({}, browser, _parseVersion(browserVersion));


            if ('querySelector' in document &&
                'addEventListener' in window &&
                'localStorage' in window &&
                'sessionStorage' in window &&
                'bind' in Function) {
                browser.isModern = true;
                cssClasses.push('is-modern-browser');
            }

            // Determines if this browser is the Android browser vs. chrome. It's always the
            // Android browser if it's webkit and the version is less than 537
            if (os.android && !browser.chrome && browser.webkit && browser.major < 537) {
                browser.androidBrowser = true;
                cssClasses.push('android-browser');
            }

            os.isTablet = !!(ipad || playbook || kindle || (android && !ua.match(/Mobile/)) ||
            (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)));

            os.isMobile = !!(!os.isTablet && !os.ipod && (android || iphone || blackberry || bb10 ||
            (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
            (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))));

            // http://stackoverflow.com/questions/19689715/what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript
            os.isRetina = ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 2)) && os.ios;
            os.isRetina && cssClasses.push('retina');

            cssClasses.push(os.isTablet ? 'tablet' : (os.isMobile ? 'mobile' : 'desktop'));

            return os;
        };

        // In browser
        if (typeof window !== 'undefined') {
            Framework.Platform.Env = detect(window.navigator.userAgent);
        } else { // In node
            //Framework.Platform.Env = detect(window.navigator.userAgent);
        }
    } else {
        Framework.ReactDOM = null;
    }



    //===============

    var postcss = require('postcss');
    var postcssJs = require('postcss-js');
    var Sass = require('sass.js');

    if (Framework.Platform.OS === 'web') { // is web
        var reactlook = require('react-look');
        var _ = require('lodash');

        var renderer = require('../../node_modules/react-look/lib/core/renderer');
        reactlook.StyleSheet.create = function(styles, scope) {
            // flat style object without selectors
            const firstKey = styles[Object.keys(styles)[0]]
            if (!_.isPlainObject(firstKey) && !_.isFunction(firstKey)) {
              return renderer.default(styles, scope)
            }

            return Object.keys(styles).reduce((classes, selector) => {
              classes[selector] = renderer.default(styles[selector], scope)
              return classes; // eslint-disable-line
            }, {})
        };

        /* sanitizeMediaQueries
        Replace this:
            @media (min-width: 768px) and (max-width: 1023px) {
                .c-header {
                  left: 7%;
                  width: 86%; } }
        With this:
            @media (min-width: 768px) and (max-width: 1023px) {
              left: 7%;
              width: 86%;
            }
        */
        var sanitizeMediaQueries = function(rawStyles) {
            return rawStyles.replace(/\}([\s]*)@media([^\{]*)\{([^\{]*)\{([^\}]*)\}/gi, '@media$2{$4}')
        }

        Framework.getStyles = function(rawStyles, scope, cb) {
            Sass.compile(rawStyles, function(rawStyles) {
                if (rawStyles.formatted && rawStyles.formatted.indexOf('Error:') !== -1) {
                    console.error('Sass error', rawStyles)
                }

                rawStyles = sanitizeMediaQueries(rawStyles.text)

                var styles = reactlook.StyleSheet.create(
                    postcssJs.objectify(
                        postcss.parse(rawStyles)
                    ),
                    scope
                );

                cb(styles)
            });
        };
    } else { // is not web
        var rnes = require('react-native-extended-stylesheet');

        var convertStyles = function(obj) {
            if (typeof obj === 'object') {
                for (var key in obj) {
                    if (!obj.hasOwnProperty(key)) continue;

                    obj[key] = convertStyles(obj[key]);
                }
                return obj;
            } else {
                if (parseInt(obj) == obj) {
                    return parseInt(obj);
                }
            }
        };

        Framework.getStyles = function(rawStyles, extendedStyles = {}) {
            var styles = postcssJs.objectify(postcss.parse(rawStyles));
            styles = convertStyles(styles);
            styles = Object.assign(styles, extendedStyles);
            styles = rnes.default.create(styles);

            return styles;
        };
    }

    //===============

    Framework.wrapStyles = function(declarations, item) {
        if (!declarations) {
            return item
        }

        if (!item.props) {
            return item;
        }

        var extension = {};

        if (item.props.children) {
            extension.children = [];
            if (Array.isArray(item.props.children)) {
                item.props.children.forEach(function(child, i) {
                    if (!child) { return; }
                    extension.children[i] = Framework.wrapStyles(declarations, child);
                });
            } else {
                extension.children[0] = Framework.wrapStyles(declarations, item.props.children);
            }
        }

        if (item.props.styles) {
            for (var declaration in declarations) {
                var styles = item.props.styles.split(' ');
                var declarationClasses = declaration.split('.').slice(1)

                // TODO: optimize this, make it recursive
                // declarationClasses = ["c-timeline__arrow", "c--completed"]
                // styles = ["c-timeline__arrow", "c--red", "c--completed"]
                var declaration1 = declarationClasses[0];
                if (styles.indexOf(declaration1) === -1) {
                    continue
                }

                // Check for a straight class match
                if (declarationClasses.length > 1) {
                    var declaration2 = declarationClasses[1];
                    if (styles.indexOf(declaration2) === -1) {
                        continue
                    }

                    // Check for a combined class match
                    if (declarationClasses.length > 2) {
                        var declaration3 = declarationClasses[2];
                        if (styles.indexOf(declaration3) === -1) {
                            continue
                        }

                        // We cant handle more than 3 yet
                        if (declarationClasses.length > 3) {
                            continue
                        }
                    }
                }

                var attr = Framework.Platform.OS === 'web' ? 'className' : 'style';
                if (extension[attr]) {
                    if (attr === 'className') {
                        extension[attr] = extension[attr] + ' ' + declarations[declaration]
                    } else if (attr === 'style') {
                        extension[attr] = Object.assign({}, extension[attr], declarations[declaration]);
                    }
                } else {
                    extension[attr] = declarations[declaration];
                }
            }

        }

        return React.cloneElement(item, extension);
    };

    // On web, we want a React Look wrapper so we can inject the styles
    // On other platforms we will use inline styles, so it isn't necessary
    if (Framework.Platform.OS === 'web') {
        var reactlook = require('react-look');
        Framework.AppWrapper = reactlook.LookRoot;
        Framework.AppConfig = reactlook.Presets['react-dom'];
        Framework.AppConfig.styleElementId = '_nextgen-engine-stylesheet-' + 'alcyone';
    } else {
        Framework.AppWrapper = <div></div>;
        Framework.AppConfig = {};
    }

    //===============
    // Redux
    //===============

    Framework.thunkMiddleware = thunkMiddleware
    Framework.createLogger = createLogger
    Framework.createStore = createStore
    Framework.combineReducers = combineReducers
    Framework.applyMiddleware = applyMiddleware
    Framework.Router = Router
    Framework.Route = Route
    Framework.Link = Link
    Framework.browserHistory = browserHistory
    Framework.Provider = Provider
    Framework.connect = connect
    Framework.syncHistoryWithStore = syncHistoryWithStore
    Framework.routerReducer = routerReducer

    //===============

    Framework.fetch = fetch

    //===============

    if (typeof GLOBAL !== 'undefined') {
        global.Framework = Framework
    }

    module.exports = Framework;
}
