"use strict";

const Koa = require("koa");
const Router = require("koa-router");
const Sequelize = require("sequelize");
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const sendgrid = require("@sendgrid/mail");

const app = new Koa();
const router = new Router();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  operatorAliases: false
});
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const Winner = sequelize.define("winner", {
  email: {
    type: Sequelize.TEXT,
    validate: {
      isEmail: true,
      notEmpty: true
    },
    unique: true
  }
});

Winner.sync({ force: true });

router.post("/", async ctx => {
  const json = ctx.request.body;

  if (!(json && json.email)) {
    ctx.status = 400;
    ctx.body = { error: "email required" };
    return;
  }

  const winner = await Winner.findOrCreate({ where: { email: json.email }});
  const created = winner[1];

  if (created) {
    sendgrid.send({
      to: process.env.TO_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: "New Challenge Winner: " + json.email,
      text: "A new person has completed the challenge! Please give a prize to " + json.email + " when they come to the booth.",
      html: "A new person has completed the challenge! Please give a prize to " + json.email + " when they come to the booth."
    });
  }

  ctx.status = 201;
  ctx.body = "";
});

app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(process.env.PORT);
