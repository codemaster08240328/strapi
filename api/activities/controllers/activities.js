"use strict";
const { sanitizeEntity } = require("strapi-utils");
const nodemailer = require("nodemailer");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const discount = async (ctx) => {
  let entities = [];
  const req = ctx.request.body;

  // 'discount' should be in request body.
  if (!("discount" in req)) {
    return ctx.response.badRequest("'discount' is a required param");
  }

  const { discount } = req;

  // 'discount' should be a number.
  if (isNaN(discount)) {
    return ctx.response.badRequest("'discount' should be number");
  }

  try {
    const activities = await strapi.services.activities.find();

    for (let i = 0; i < activities.length; i++) {
      const entity = await strapi.services.activities.update(
        { id: activities[i].id },
        {
          Price: (activities[i].Price * (100 - parseInt(discount))) / 100, // decrease the price by {discount}%
        }
      );

      entities.push(entity);
    }
  } catch (e) {
    console.log("error", e);
    return ctx.response.badImplementation(e);
  }

  return entities.map((entity) =>
    sanitizeEntity(entity, { model: strapi.models.activities })
  );
};

const create = async (ctx) => {
  let entity;

  if (ctx.is("multipart")) {
    const { data, files } = parseMultipartData(ctx);
    entity = await strapi.services.activities.create(data, { files });
  } else {
    entity = await strapi.services.activities.create(ctx.request.body);
  }

  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  await transporter.sendMail({
    to: "info@mallorcard.es",
    from: "kason.tien.2020@gmail.com",
    subject: "A new entry created",
    text: "text",
    html: "<h1>Text</h1>",
  });

  return sanitizeEntity(entity, { model: strapi.models.activities });
};

module.exports = {
  discount,
  create,
};
