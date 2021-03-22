// リクエスト処理をハンドラに振り分ける
'use strict';
const postsHandler = require('./posts-handler');

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
      // TODO ログアウト
      break;
    default:
      break;
  }
}

module.exports = {
  route,
};
