'use strict';
//  /posts のリクエストを処理

/**
 * /posts のリクエストをGETとPOSTに振り分ける
 * @param {*} req リクエスト
 * @param {*} res レスポンス
 */
function handle(req, res) {
  console.log('posts-handler module');
  switch (req.method) {
    case 'GET':
      console.log('GET');
      res.write('Hello World!');
      res.end();
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
