const path = require('path');

const {
  NODE_ENV,
  PORT,
  URL
} = require('./src/constants');

// Define services

const Services = {
  "Dereva": {},
  "Example": {}
};

// Define apps

const Apps = [
  "/",
  "transaction-viewer"
];

// Configure HTTP

const isProduction = NODE_ENV === 'production';

const http = require(isProduction ? 'https' : 'http');
const express = require('express');
const cors = require('cors');

const httpApi = express();

httpApi.use(express.json({ limit: '10mb' }));
httpApi.use(express.urlencoded({ extended: false, limit: '10mb' }));
httpApi.use(cors());

const server = http.createServer(httpApi);

server.listen(PORT, () => {
  // Configure WS

  const socketApi = require('socket.io')(server);

  // Serve HTML pages

  Apps.forEach(directory => {
    httpApi.use(
      express.static(
        path.join(__dirname, './src/apps', directory)
      )
    );
  });

  console.log(`Service "HttpApi" is online at ${URL}`);
  console.log(`Service "SocketApi" is online at ${URL}`);

  // Start backend services

  Object.keys(Services).forEach(key => {
    const serviceSlug = key.replace(/ /g, '-');

    Services[serviceSlug] = require(`./src/services/${serviceSlug.toLowerCase()}`);
  });

  // Ping handler

  httpApi.get('/', (_, res) => res.send('Services are online.'));

  // Route service requests

  Object.keys(Services).forEach(name => {
    const slug = (
      `/${name.toLowerCase().replace(/[^\w]+/g, '-')}`
    );

    const Service = Services[name];

    if (Object.keys(Service).length) {

      console.log(`Service "${name}" is online at ${URL}${slug}`);

      // Handle http

      if (Service.type === 'http') {
        httpApi.get(`${slug}/*`, (req, res) => {
          if (Object.keys(req.query).length) {
            return Service.onHttpSearch(req, res);
          }

          return Service.onHttpGet(req, res);
        });

        httpApi.post(`${slug}/*`, (req, res) => (
          Service.onHttpPost(req, res)
        ));

        httpApi.put(`${slug}/*`, (req, res) => (
          Service.onHttpPut(req, res)
        ));

        httpApi.delete(`${slug}/*`, (req, res) => (
          Service.onHttpDelete(req, res)
        ));
      }

      // Handle websocket

      if (Service.type === 'ws') {
        socketApi.on('connect', async socket => {
          await Service.onWsConnect(
            {
              method: 'connection',
              body: socket
            },
            socket
          );

          socket.on('disconnect', req => {
            Service.onWsDisconnect(req, socket);
          });

          // eslint-disable-next-line no-magic-numbers
          socket.on(`${slug.substring(1)}:request`, req => {
            Service.onWsRequest(req, socket);
          });
        });

        Service.onWsReady();
      }
    }
  });
});
