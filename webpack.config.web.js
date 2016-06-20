var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        'game.web': ['./App/index.web.js'],
        // 'game.ios': ['./App/index.ios.js'],
        // 'game.android': ['./App/index.android.js']
    },
    output: {
        path: __dirname + '/App/Build/Release',
        publicPath: '/App/Build/Release/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json']
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                loader: 'babel',
                include: [path.join(__dirname + '/App'), path.join(__dirname + '/node_modules/react-native-extended-stylesheet')],
                query: {
                    cacheDirectory: true,
                    plugins: [],
                    presets: ['react', 'es2015', 'stage-0']
                }
            },
            {
                test: /\.css$/,
                include: path.join(__dirname + '/App'),
                loaders: [
                    'raw'
                ]
            },
            {
                test: /\.json$/,
                include: path.join(__dirname + '/'), // Thanks cheerio :-/
                loader: 'json-loader'
            },
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/^(react-native)$/),
        new webpack.DefinePlugin({ 
            'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') } 
        })
    ]
};
