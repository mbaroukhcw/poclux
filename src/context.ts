import { AsyncLocalStorage } from "async_hooks";

type Context = {
  username?: string;
};
const asyncLogStorage = new AsyncLocalStorage<Map<string, any>>();

const context = {
  start: (callback: () => void) => {
    asyncLogStorage.run(new Map(), callback);
  },
  set: (key: string, value: any) => {
    asyncLogStorage.getStore()?.set(key, value);
  },
  get: (key: string) => asyncLogStorage.getStore()?.get(key),
};

export default context;
