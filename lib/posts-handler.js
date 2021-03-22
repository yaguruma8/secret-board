//  /posts のリクエストを処理
'use strict';

const pug = require('pug');
const contents = [];
/**
 * /posts のリクエストをGETとPOSTに振り分ける
 * @param {http.IncomingMessage} req リクエスト
 * @param {http.ServerResponse} res レスポンス
 */
function handle(req, res) {
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      res.end(pug.renderFile('./views/posts.pug'));
      break;
    case 'POST':
      let buffer = [];
      req
        .on('data', (chunk) => {
          buffer.push(chunk);
        })
        .on('end', () => {
          const body = Buffer.concat(buffer).toString();
          const decoded = decodeURIComponent(body);
          const content = decoded.split(/content=/)[1];
          contents.push(content);
          console.info(`投稿されました: ${content}`);
          console.info(`投稿された全内容: ${contents}`);
          handleRedirectPosts(req, res);
        });
      break;
    default:
      break;
  }
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    Location: '/posts',
  });
  res.end();
}

module.exports = {
  handle,
};
