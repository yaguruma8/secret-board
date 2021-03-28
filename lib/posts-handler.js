//  /posts のリクエストを処理
'use strict';

const pug = require('pug');
const utils = require('./handler-utils');
const Post = require('./post');
const Cookies = require('cookies');
const moment = require('moment-timezone');
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
        posts.forEach((post) => {
          post.formattedCreatedAt = moment(post.createdAt)
            .tz('Asia/Tokyo')
            .format('YYYY年MM月DD日 HH時mm分ss秒');
        });
        res.end(
          pug.renderFile('./views/posts.pug', { posts: posts, user: req.user })
        );
      });
      console.info(
        `閲覧がありました: user: ${req.user}, ` +
          `trackingId: ${cookies.get(trackingIdKey)}, ` +
          `remoteAddless: ${req.socket.remoteAddress}, ` +
          `UserAgent: ${req.headers['user-agent']}`
      );
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
            trackingCookie: cookies.get(trackingIdKey),
            postedBy: req.user,
          }).then(() => {
            handleRedirectPosts(req, res);
          });
        });
      break;
    default:
      utils.handleBadRequest(req, res);
      break;
  }
}

/**
 * 指定されたidの投稿を削除する
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      const buffer = [];
      req
        .on('data', (chunk) => {
          // chunkを受け取る
          buffer.push(chunk);
        })
        .on('end', () => {
          const body = Buffer.concat(buffer).toString();
          const decoded = decodeURIComponent(body);
          const postedId = decoded.split(/id=/)[1];
          // 該当の投稿IDのデータをデータベースから探す
          Post.findByPk(postedId).then((post) => {
            // 認可
            if (req.user === post.postedBy || req.user === 'admin') {
              // 削除する
              post.destroy().then(() => {
                console.info(
                  `削除されました: user: ${req.user}, ` +
                    `remoteAddress: ${req.connection.remoteAddress}, ` +
                    `userAgent: ${req.headers['user-agent']} `
                );
                handleRedirectPosts(req, res);
              });
            }
          });
        });
      break;
    default:
      utils.handleBadRequest(req, res);
      break;
  }
}

/**
 * トラッキングCookieの付与
 * @param {Cookies} cookies
 */
function addTrackingCookie(cookies) {
  // Coockieが取得できない場合のみ新しいCookieをセットする
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
  handleDelete,
};
