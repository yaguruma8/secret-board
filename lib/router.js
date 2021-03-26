// リクエスト処理をハンドラに振り分ける
'use strict';
const postsHandler = require('./posts-handler');
const utils = require('./handler-utils');

/**
 * リクエストをハンドラに振り分ける
 * @param {http.IncomingMessage} req リクエスト
 * @param {http.ServerResponse} res レスポンス
 */
function route(req, res) {
  switch (req.url) {
    case '/posts':
      // 投稿
      postsHandler.handle(req, res);
      break;
    case '/logout':
      utils.handleLogout(req, res);
      break;
    case '/posts?delete=1':
      // 削除
      postsHandler.handleDelete(req, res);
      break;
    case '/favicon.ico':
      utils.handleFavicon(req, res)
      break;
    case '/':
      // ルートのアクセスは投稿一覧へリダイレクト
      res.writeHead(308, {
        Location: '/posts',
      });
      res.end();
      break;
    default:
      utils.handleNotFound(req, res);
      break;
  }
}

module.exports = {
  route,
};
