'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost/secret_board',
  {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
    },
    postedBy: {
      type: DataTypes.STRING,
    },
    trackingCookie: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

Post.sync();
module.exports = Post;
