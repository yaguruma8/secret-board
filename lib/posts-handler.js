//  /posts のリクエストを処理
'use strict';

const pug = require('pug');
const crypto = require('crypto');
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
  const trackingId = addTrackingCookie(cookies, req.user);
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      // データベースから読み込み
      Post.findAll({ order: [['id', 'DESC']] }).then((posts) => {
        posts.forEach((post) => {
          post.content = post.content.replace(/\+/g, ' ');
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
          `trackingId: ${trackingId}, ` +
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
            trackingCookie: trackingId,
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
 * @param {string} userName
 * @returns {string}
 */
function addTrackingCookie(cookies, userName) {
  // cookieを取得
  const reqTrackingId = cookies.get(trackingIdKey);
  if (isValidTrackingId(reqTrackingId, userName)) {
    // 計算と一致する場合はそのまま
    return reqTrackingId;
  } else {
    // 一致しない場合は新しいCookieをセットする
    const origin = Number.parseInt(crypto.randomBytes(8).toString('hex'), 16);
    const newTrackingId = `${origin}_${createValidHash(origin, userName)}`;
    const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    cookies.set(trackingIdKey, newTrackingId, { expires: tomorrow });
    return newTrackingId;
  }
}

/**
 * リクエストのトラッキングIDがユーザー一致しているか検証
 * @param {string} trackingId
 * @param {string} userName
 */
function isValidTrackingId(trackingId, userName) {
  if (!trackingId) {
    return false;
  }
  // cookieを前後に分離する
  const [origin, reqHash] = trackingId.split('_');
  // 前＋userNameのハッシュ値と後ろが同じかを返す
  return createValidHash(origin, userName) === reqHash;
}

const secretKey =
  'b7e0e9800fc27c006e2e83bfe6c31619ba923fc90830feda0b4a5425cf6334b30e6cbf45e69ed4d40d01da7c678118dbfc116b355217e11d2d44061ad377dc22ecf4136a6d40134c8e7d709c90f0a5ca6707e97ecf1c6e1f26056d9333a85d80ec9c699f384ea091e3b75353e058c90c1881769061534ca2a4936a05fcfa7da14ad96a4dc3a6bfd92768e0f03c7dfd5d6cd9af1561d0f47b5315d180bb30adb8fbb94db052bebfc865f080ca23e6a4635ade9d473acb842e77b2b251f3cd3430536fd2cc61b608e35ca73b22761baadfcbbbe06736a6754390b24d3c92fad68302b177d7e5d040b6e798f27e938c32dcc88cbad88cfbc478ceaa5caf74978020';

function createValidHash(origin, userName) {
  // origin+userNameのハッシュ値を計算して返す
  const sha1sum = crypto.createHash('sha1');
  sha1sum.update(origin + userName + secretKey);
  return sha1sum.digest('hex');
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
