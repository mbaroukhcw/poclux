import { Options } from "@mikro-orm/core";
import { Center } from "./center.model";
import { ModelSubscriber } from "./model.subscriber";

const options: Options = {
  entities: [Center],
  subscribers: [new ModelSubscriber()],
  dbName: "center.db",
  type: "sqlite",
};
export default options;
