"use strict";

const Koa = require("koa");
const Sequelize = require("sequelize");

const app = new Koa();
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  operatorAliases: false
});

app.use(async ctx => {
  ctx.body = "Hello, world.";
});

app.listen(process.env.PORT);
