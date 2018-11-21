"use strict";

const Koa = require("koa");
const Router = require("koa-router");
const Sequelize = require("sequelize");
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  operatorAliases: false
});

const Winner = sequelize.define("winner", {
  email: {
    type: Sequelize.TEXT,
    validate: {
      isEmail: true,
      notNull: true,
      notEmpty: true
    }
  },
  indexes: [
    {
      unique: true,
      fields: ["email"]
    }
  ]
});

Winner.sync({ force: true });

router.post("/", async ctx => {
  const json = ctx.request.body;

  if (!(json && json.email)) {
    ctx.status = 400;
    ctx.body = { error: "email required" };
    return;
  }

  let winner = await Winner.findOrCreate({ where: { email: json.email }});
  console.log(winner);

  ctx.status = 201;
  ctx.body = "";
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(process.env.PORT);
