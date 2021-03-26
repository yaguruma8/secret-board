// /posts 以外のリクエストを処理する
'use strict';

const fs = require('fs');
const pug = require('pug');

/**
 * ログアウトする
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html;charset=utf-8',
  });
  res.write(pug.renderFile('./views/logout.pug'));
  res.end();
}

/**
 * ファビコンを表示する
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon',
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon);
}

/**
 * 404 Not Found を返す
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/html;charset=utf-8',
  });
  res.write('404 Not Found');
  res.end();
}

/**
 * 400 Bad Requestを返す
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  res.end('400 Bad Request');
}

module.exports = {
  handleLogout,
  handleFavicon,
  handleNotFound,
  handleBadRequest,
};
