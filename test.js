'use strict'

// XSS脆弱性に対するテスト
const pug = require('pug')
const assert = require('assert')

const html = pug.renderFile('./views/posts.pug', {
  posts: [
    {
    id: 1,
    content: "<script>alert('test');</script>",
    postedBy: 'admin',
    trackingCookie: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    }
  ],
  user: 'admin'
})

assert(html.includes("&lt;script&gt;alert('test');&lt;/script&gt;"));
console.log('テストが正常に完了しました');