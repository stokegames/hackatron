import express from 'express';
import http from 'http';
import request from 'request';
import url from 'url';
import fs from 'fs';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config.web.js';


import { Router, RouterContext, match } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import React from 'react'
import { renderToString } from 'react-dom/server'

var indexHTML = '';

fs.readFile(__dirname + '/main.html', function(err, html) {
    indexHTML = html.toString();
});

function renderFullPage(html, state) {
    var result = indexHTML + '';
    // We need to add an extra <div> wrapper here
    // http://stackoverflow.com/questions/33521047/warning-react-attempted-to-reuse-markup-in-a-container-but-the-checksum-was-inv
    let initialState = JSON.stringify(state);
    result = result.replace(
        `
            <div id="ui"></div>
        `.trim(),
        `
            <div id="ui"><div>${html}</div></div>
            <script>window.$REDUX_STATE = ${initialState}</script>
        `.trim()
    )

    return result
}

function fetchComponentData(dispatch, components, params) {
  const needs = components.reduce((prev, current) => {
  	return Object.keys(current).reduce((acc, key) => {
  		return current[key].hasOwnProperty('needs') ? current[key].needs.concat(acc) : acc
  	}, prev)
  }, []);

  const promises = needs.map(need => dispatch(need(params)));

  return Promise.all(promises);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

class Server {
    constructor() {
        this.env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
        this.host = process.env.HOST ? process.env.HOST : '0.0.0.0';
        this.port = process.env.PORT ? process.env.PORT : 10020;
        this.events = [];
        this.clients = [];
        this.hostClient = null;
    }

    init() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = require('socket.io').listen(this.server);

        if (this.env === 'development') {
            webpackConfig.devtool = 'eval'; // Speed up incremental builds
            webpackConfig.entry['game.web'].unshift('webpack-hot-middleware/client?path=/__webpack_hmr');
            webpackConfig.output.publicPath = '/Build/Release/';
            webpackConfig.plugins.unshift(new webpack.HotModuleReplacementPlugin());
            webpackConfig.plugins.unshift(new webpack.NoErrorsPlugin());
            webpackConfig.module.loaders[0].query.presets.push('react-hmre');

            const compiler = webpack(webpackConfig);

            this.app.use(webpackDevMiddleware(compiler, {
                publicPath: webpackConfig.output.publicPath,
                stats: {
                    colors: true,
                    hash: false,
                    timings: true,
                    chunks: false,
                    chunkModules: false,
                    modules: false
                }
            }));

            this.app.use(webpackHotMiddleware(compiler, {
                hot: true,
                historyApiFallback: true
            }));
        }

        // Facebook Canvas needs to send a POST request
        this.app.post('/', (req, res, next) => {
            req.pipe(request.get('http://' + this.host + ':' + this.port + '/')).pipe(res);
        });

        // Web server
        this.app.use(express.static(__dirname + '/../App'));

        // React app
        this.app.use((req, res, next) => {
            var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            console.info('Requested: ' + fullUrl)
            var Router2 = require('../App/Router').default;

            // https://github.com/mz026/universal-redux-template/blob/master/app/server/server.js
            var LOCATION_CHANGE = '@@router/LOCATION_CHANGE';
            Router2.store.dispatch({
              type: LOCATION_CHANGE,
              payload: req.url
            });

            // react-router
            match({
                routes: Router2.routes,
                location: req.url
            }, (error, redirectLocation, renderProps) => {
                console.log('Error:', error ? true : false);
                console.log('redirectLocation:', redirectLocation ? true : false);
                console.log('renderProps:', renderProps ? true : false);

                if (error) {
                    return res.status(500).send(error.message);
                }

                if (redirectLocation) {
                    return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
                }

                if (!renderProps) {
                    // return next('err msg: route not found'); // yield control to next middleware to handle the request
                    return res.status(404).send('Not found');
                }

                // console.log( '\nserver > renderProps: \n', require('util').inspect( renderProps, false, 1, true) )
                // console.log( '\nserver > renderProps: \n', require('util').inspect( renderProps.components, false, 3, true) )

                // this is where universal rendering happens,
                // fetchComponentData() will trigger actions listed in static "needs" props in each container component
                // and wait for all of them to complete before continuing rendering the page,
                // hence ensuring all data needed was fetched before proceeding
                //
                // renderProps: contains all necessary data, e.g: routes, router, history, components...
                fetchComponentData(
                    Router2.store.dispatch,
                    renderProps.components,
                    renderProps.params
                )
                .then(() => {
                    const initView = renderToString((
                        <Provider store={Router2.store}>
                            <RouterContext {...renderProps} />
                        </Provider>
                    ))

                    // console.log('\ninitView:\n', initView);

                    let state = Router2.store.getState();
                    // console.log( '\nstate: ', state )
                    
                    let page = renderFullPage(initView, state)
                    // console.log( '\npage:\n', page );

                    return page;
                })
                .then(page => {
                    res.status(200).send(page)
                })
                .catch(err => {
                    console.log('Caught error while rendering components', err.stack, err.line, err.file, err)
                    res.end(err.message)
                });
            })
        })
    }

    start() {
        this.io.sockets.on('connection', (socket) => {
            this.onSocketConnect(socket);

            socket.on('disconnect', () => {
                this.onSocketDisconnect(socket);
            });
        });

        this.monitorHost();

        setInterval(() => {
            if (!this.hostClient) return console.log('No host');
            if (!this.hostClient.player) return console.log('Host has no player');

            console.log('Host: ', this.hostClient.player.id);
        }, 2000);

        this.server.listen(this.port, this.host, (err) => {
            if (err) { console.log(err); }

            console.info('==> Listening on port %s (env: ' + this.env + '). Open up http://0.0.0.0:%s/ in your browser.', this.port, this.port);
        });
    }

    setHost(client) {
        console.log('Setting host to player: ' + client.player.id);
        this.hostClient = client;
    }

    findNewHost() {
        if (this.clients.length > 0) {
            var i = getRandomInt(0, this.clients.length-1);
            var client = this.clients[i];

            // Make sure client had time to initialize the player
            if (client) {
                this.setHost(client);

                console.log('New host: ' + this.hostClient.player.id);
                this.io.sockets.emit('setHost', {player: this.hostClient.player});
            }
        }
    }

    getClientHost() {
        if (!this.clients.length) { return; }
        return this.clients.reduce((previousClient, currentClient) => { if (previousClient && previousClient.player.id === this.hostClient.player.id) { return previousClient; } else if (currentClient.player.id === this.hostClient.player.id) { return currentClient; }});
    }

    findClientBySocket(socket) {
        if (!this.clients.length) { return; }
        return this.clients.reduce((previousClient, currentClient) => { if (previousClient && previousClient.socket === socket) { return previousClient; } else if (currentClient.socket === socket) { return currentClient; }});
    }

    addClient(client) {
        console.log('Adding player: ' + client.player.id);
        this.clients.push(client);
    }

    removeClient(client) {
        console.log('Removing player: ' + client.player.id);

        this.clients.splice(this.clients.indexOf(client), 1);
    }

    fireEvent(socket, event) {
        socket.emit('events', {events: [event]});
    }

    fireAllPlayers(event) {
        this.io.sockets.emit('events', {events: [event]});
    }

    parseEvent(socket, event) {
        if (event.key === 'newPlayer') {
            console.log('Handshaking...');

            this.addClient({socket: socket, player: event.info.player});

            // If it's the first client or there's no hosts, lets set it as the new host
            if (!this.hostClient) {
                this.setHost(this.clients[this.clients.length-1]);
                console.log('New host: ' + this.hostClient.player.id);
            }

            this.fireEvent(socket, {key: 'setHost', info: {player: this.hostClient.player}});
        } else if (event.key === 'this.findNewHost') {
            console.log("Finding new host....");
            var client = this.findClientBySocket(socket);
            this.removeClient(client);
            this.hostClient = null;
            this.findNewHost();
        } else {
            //socket.broadcast.emit(event.key, event.info);
        }
    }

    onSocketConnect(socket) {
        console.log('New connection.. waiting for handshake');

        // TODO: give them 10 seconds to identify as a newPlayer, or cut them off

        socket.on('events', (data) => {
            //console.log('Incoming events: ' + data);
            data = JSON.parse(data);

            data.events.forEach((event) => { this.parseEvent(socket, event); });

            socket.broadcast.emit('events', data);
        });
    }

    onSocketDisconnect(socket) {
        var client = this.findClientBySocket(socket);

        if (!client) { return; }

        this.removeClient(client);

        // If this client was the host,
        // and there's at least one more client connected,
        // lets choose a new random host,
        // and broadcast it to everybody
        if (client.player.id === this.hostClient.player.id) {
            this.hostClient = null;
            this.findNewHost();
        }

        if (this.clients.length === 0) {
            this.hostClient = null;
        }

        this.fireAllPlayers({key: 'playerLeave', info: {player: client.player}});
    }

    // Monitor the clients to make sure they are still defined
    monitorHost() {
        if (!this.hostClient) {
            this.findNewHost();
        }

        setTimeout(this.monitorHost.bind(this), 50);
    }
}

export default Server;
