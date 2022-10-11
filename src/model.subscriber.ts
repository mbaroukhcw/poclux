import { EventSubscriber, FlushEventArgs, Subscriber } from "@mikro-orm/core";
import { Center } from "./center.model";
import context from "./context";

@Subscriber()
export class ModelSubscriber implements EventSubscriber {
  getSubscribedEntities() {
    return [Center];
  }
  afterFlush(args: FlushEventArgs): void | Promise<void> {
    const username = context.get("username") as string;

    const changes = args.uow.getChangeSets();
    const marker = args.uow as any;
    if (!marker.marked) {
      marker.marked = true;
      const changeLogs = [
        ...changes.map(
          (change) =>
            `Operation: ${change.type}, model: ${
              change.name
            }, by: ${username}, from: ${JSON.stringify(
              change.originalEntity,
              null,
              4
            )}, to: ${JSON.stringify(change.entity, null, 4)}`
        ),
      ];

      // log changes. We could also send to paper trail, record in database, ...
      console.log(changeLogs);
    }
  }
}
