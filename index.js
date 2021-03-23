// HTTPサーバを起動する
'use strict';

const http = require('http');
const router = require('./lib/router');
const auth = require('http-auth');

const basic = auth.basic({
  realm: 'Enter username and password',
  file: './user.htpasswd',
});

const server = http
  .createServer(basic, (req, res) => {
    router.route(req, res);
  })
  .on('error', (e) => {
    console.error('Server Error', e);
  })
  .on('clientError', (e) => {
    console.error('Client Error', e);
  });

const port = 8000;
server.listen(port, () => {
  console.info(`Listening on ${port}`);
});
