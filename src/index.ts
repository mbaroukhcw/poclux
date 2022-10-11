import "reflect-metadata";
import express from "express";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { Center } from "./center.model";
import context from "./context";
import router from "./center.routes";

const main = async () => {
  const orm = await MikroORM.init();
  const em = orm.em;

  const app = express();
  app.use(express.json());

  app.use((_req, _res, next) => {
    context.start(() => {
      context.set("username", "mbaroukh");
      context.set("repository", em.getRepository(Center));
      context.set("locale", _req.query?.locale || "default");
      RequestContext.create(em, next);
    });
  });

  app.use("/center", router);

  app.listen(3000, () => {
    console.log(`Started : http://localhost:3000`);
  });
};
main();
