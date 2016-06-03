
//===============

var Framework = {};

//===============

var React = require('React');

Framework.React = React;
Framework.Component = React.Component;

//===============

if (typeof process.argv !== 'undefined') {
    var argv = require('minimist')(process.argv.slice(2));

    Framework.Platform = {
        OS: argv.platform ? argv.platform : 'web',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isRetina: false
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
}

//===============

Framework.Platform.Env = {
    isMobile: false,
    isTablet: false,
    isRetina: false
};

if (Framework.Platform.OS === 'web') {
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

    Framework.Platform.Env = detect(window.navigator.userAgent);
} else {
}



//===============

var postcss = require('postcss');
var postcssJs = require('postcss-js');

if (Framework.Platform.OS === 'web') { // is web
    var reactlook = require('react-look');

    Framework.getStyles = function(rawStyles) {
        var styles = reactlook.StyleSheet.create(postcssJs.objectify(postcss.parse(rawStyles)));
        return styles;
    };
} else { // else
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

Framework.wrapStyles = function(item) {
    if (!item.props) {
        return item;
    }

    var extension = {};

    if (item.props.children && Array.isArray(item.props.children)) {
        extension.children = [];
        item.props.children.forEach(function(child, i) {
            if (!child) { return; }
            extension.children[i] = Framework.wrapStyles(child);
        });
    }

    if (item.props.styles) {
        var attr = Framework.Platform.OS === 'web' ? 'className' : 'style';
        if (item.props[attr]) {
            extension[attr] = Object.assign({}, item.props[attr], item.props.styles);
        } else {
            extension[attr] = item.props.styles;
        }
    }

    return React.cloneElement(item, extension);
};

//===============

module.exports = Framework;
