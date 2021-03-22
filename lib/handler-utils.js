// /posts 以外のリクエストを処理する
'use strict';

const pug = require('pug');

function handleLogout(req, res) {
  // ログアウトの処理
  res.writeHead(401, {
    'Content-Type': 'text/html;charset=utf-8',
  });
  res.write(pug.renderFile('./views/logout.pug'));
  res.end();
}

module.exports = {
  handleLogout,
};
