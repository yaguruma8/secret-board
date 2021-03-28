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
    trackingCookie: '4391976947991005_0d6aeb0d6ad6bc82d29857339d6f304b3054dd5b',
    createdAt: new Date(),
    updatedAt: new Date(),
    }
  ],
  user: 'admin'
})

assert(html.includes("&lt;script&gt;alert('test');&lt;/script&gt;"));
console.log('テストが正常に完了しました');