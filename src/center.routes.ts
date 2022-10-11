import { EntityRepository, wrap } from "@mikro-orm/core";
import { Center } from "./center.model";
import Router from "express-promise-router";
import * as uuid from "uuid";
import context from "./context";
import { modelToDTOFactory, dtoToModelFactory } from "./translation.mapper";

// Create mappers in & out and specify which fields are translated
const modelToDTO = modelToDTOFactory(["description", "name"]);
const dtoToModel = dtoToModelFactory(["description", "name"]);

const router = Router();

const getRepository = () => {
  return context.get("repository") as EntityRepository<Center>;
};
const getLocale = () => {
  return context.get("locale") as string;
};

router.get("/", async (_req, res) => {
  const centers = await getRepository().findAll();
  res.status(200).send(centers.map((c) => modelToDTO(c, getLocale())));
});
router.post("/", async (req, res) => {
  const now = new Date();
  const center = await getRepository().create({
    ...req.body,
    id: uuid.v4(),
    createdAt: now,
    updatedAt: now,
  });
  await getRepository().persist(center).flush();
  res.status(200).send(center);
});
router.delete("/:id", async (req, res) => {
  const center = await getRepository().findOne(req.params.id);
  if (center) {
    await getRepository().remove(center).flush();
  }
  res.status(200).send(center);
});
router.get("/:id", async (req, res) => {
  const center = await getRepository().findOne(req.params.id);
  if (!center) {
    res.status(404).send();
  } else {
    res.status(200).send(modelToDTO(center, getLocale()));
  }
});
router.patch("/:id", async (req, res) => {
  const now = new Date();
  const center = await getRepository().findOneOrFail(req.params.id);
  if (!center) {
    throw new Error();
  }
  dtoToModel(req.body, center, getLocale());
  wrap(center).assign({
    updatedAt: now,
  });
  await getRepository().flush();
  res.status(200).send(modelToDTO(center, getLocale()));
});

export default router;
