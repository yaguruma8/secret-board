//  /posts のリクエストを処理
'use strict';

const pug = require('pug');
/**
 * /posts のリクエストをGETとPOSTに振り分ける
 * @param {*} req リクエスト
 * @param {*} res レスポンス
 */
function handle(req, res) {
  console.log('posts-handler module');
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      res.end(pug.renderFile('./views/posts.pug'));
      break;
    case 'POST':
      console.log('POST');
      break;
    default:
      break;
  }
}

module.exports = {
  handle,
};
