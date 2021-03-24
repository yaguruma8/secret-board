//  /posts のリクエストを処理
'use strict';

const pug = require('pug');
const Post = require('./post');
const Cookies = require('cookies');
const trackingIdKey = 'tracking_id';

/**
 * /posts のリクエストをGETとPOSTに振り分ける
 * @param {http.IncomingMessage} req リクエスト
 * @param {http.ServerResponse} res レスポンス
 */
function handle(req, res) {
  // Cookieの付与
  const cookies = new Cookies(req, res);
  addTrackingCookie(cookies);
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      // データベースから読み込み
      Post.findAll({ order: [['id', 'DESC']] }).then((posts) => {
        res.end(pug.renderFile('./views/posts.pug', { posts: posts }));
      });
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
          console.info(`投稿されました: ${content}`);
          // データベースに保存
          Post.create({
            content: content,
            trackingCookie: null,
            postedBy: req.user,
          }).then(() => {
            handleRedirectPosts(req, res);
          });
        });
      break;
    default:
      break;
  }
}

/**
 * トラッキングCookieの付与
 * @param {Cookies} cookies
 */
function addTrackingCookie(cookies) {
  if (!cookies.get(trackingIdKey)) {
    const trackingId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
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
