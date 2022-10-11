# Description

This is a first proposal of how could be implemented audit log and translations.  
It uses [mikro-orm](https://mikro-orm.io/). It could use another ORM. About Prisma : it should be possible too but it needs some work.

## Usage :

```
npm install
```

Then, create database (sqlite) with

```
npm run db:sync
```

Finally, you can start the server

```
npm run start
```

and use the api :

### Delete all records :

```bash
curl "http://localhost:3000/center"|json_reformat |grep '"id"'|awk -F'"' '{print $4}'|xargs -n 1 -I ID curl -XDELETE http://localhost:3000/center/ID
```

### Create sample records

```bash
seq 1 1|xargs -n 1 -I I curl -H "content-type: application/json" -d '{"name": "center I", "description": "Description center I"}' -XPOST http://localhost:3000/center
```

### Update records description

```bash
curl "http://localhost:3000/center"|json_reformat |grep '"id"'|awk -F'"' '{print $4}'|xargs -n 1 -I ID curl -XPATCH -H "content-type: application/json" -d '{ "description": "description updated" }' http://localhost:3000/center/ID
```

# Audit

When records are created, deleted or modified, the server will display a log like this :

```javascript
[
  "Operation: create, model: Center, by: mbaroukh, from: undefined, to: {\n" +
    '    "id": "5d79ff43-5988-431a-beb0-3141574fadf3",\n' +
    '    "name": "center 1",\n' +
    '    "description": "Description center 1",\n' +
    '    "createdAt": "2022-10-11T10:38:58.436Z",\n' +
    '    "updatedAt": "2022-10-11T10:38:58.436Z"\n' +
    "}",
][
  "Operation: update, model: Center, by: mbaroukh, from: {\n" +
    '    "id": "5d79ff43-5988-431a-beb0-3141574fadf3",\n' +
    '    "name": "center 1",\n' +
    '    "description": "Description center 1",\n' +
    '    "createdAt": 1665484738436,\n' +
    '    "updatedAt": 1665484738436,\n' +
    '    "translations": null\n' +
    "}, to: {\n" +
    '    "id": "5d79ff43-5988-431a-beb0-3141574fadf3",\n' +
    '    "name": "center 1",\n' +
    '    "description": "description updated",\n' +
    '    "createdAt": "2022-10-11T10:38:58.436Z",\n' +
    '    "updatedAt": "2022-10-11T10:39:05.144Z",\n' +
    '    "translations": {}\n' +
    "}"
][
  "Operation: delete, model: Center, by: mbaroukh, from: undefined, to: {\n" +
    '    "id": "5d79ff43-5988-431a-beb0-3141574fadf3",\n' +
    '    "name": "center 1",\n' +
    '    "description": "description updated",\n' +
    '    "createdAt": "2022-10-11T10:38:58.436Z",\n' +
    '    "updatedAt": "2022-10-11T10:39:05.144Z",\n' +
    '    "translations": {}\n' +
    "}"
];
```

The log contain the model (table) used, the operation (create, update, delete), the author (actualy forced line 17 of [the index](./src/index.ts)), a json with previous value (if present) and a json with new value (if present too).

All is handled with just [one subscriber](./src/model.subscriber.ts) (log is line #31) that can handle reporting for all entities.

# Translations

imho, it would be hard and resource consuming to handle the translations in the repository or on the entity itself.

Instead here I use a [helper](./src/translation.mapper.ts) to generate mappers to handle it. Those mapper are the used on the
[controller](./src/center.routes.ts) (sorry, to simplify I merged router, controller and services in this poc).

The controller use thos mapper to convert from the entity to the endpoint dto or from the request body to the entity.

In this test, I use the query param **locale** to specify which locale I want to read or write.

Example usage:

Create a center:

```bash
curl -H "content-type: application/json" -d '{"name": "test center", "description": "Description for test center"}' -XPOST http://localhost:3000/center

{"id":"ae87c04d-e0f2-43be-93a1-649947db30f9","name":"test center","description":"Description for test center","createdAt":"2022-10-11T10:50:21.772Z","updatedAt":"2022-10-11T10:50:21.772Z"}
```

Update french translation for description field:

```bash
curl -H "content-type: application/json" -d '{ "description": "french description"}' -XPATCH http://localhost:3000/center/ae87c04d-e0f2-43be-93a1-649947db30f9?locale=fr_FR

{"id":"ae87c04d-e0f2-43be-93a1-649947db30f9","name":"test center","description":"french description","createdAt":"2022-10-11T10:50:21.772Z","updatedAt":"2022-10-11T10:51:01.371Z"}
```

It produces this log :

```javascript
[
  "Operation: update, model: Center, by: mbaroukh, from: {\n" +
    '    "id": "ae87c04d-e0f2-43be-93a1-649947db30f9",\n' +
    '    "name": "test center",\n' +
    '    "description": "Description for test center",\n' +
    '    "createdAt": 1665485421772,\n' +
    '    "updatedAt": 1665485421772,\n' +
    '    "translations": null\n' +
    "}, to: {\n" +
    '    "id": "ae87c04d-e0f2-43be-93a1-649947db30f9",\n' +
    '    "name": "test center",\n' +
    '    "description": "Description for test center",\n' +
    '    "createdAt": "2022-10-11T10:50:21.772Z",\n' +
    '    "updatedAt": "2022-10-11T10:51:01.371Z",\n' +
    '    "translations": {\n' +
    '        "fr_FR": {\n' +
    '            "description": "french description"\n' +
    "        }\n" +
    "    }\n" +
    "}",
];
```

We can now retrieve either the default value :

```bash
curl http://localhost:3000/center/ae87c04d-e0f2-43be-93a1-649947db30f9

{"id":"ae87c04d-e0f2-43be-93a1-649947db30f9","name":"test center","description":"Description for test center","createdAt":"2022-10-11T10:50:21.772Z","updatedAt":"2022-10-11T10:51:01.371Z"}
```

of the french version :

```bash
curl "http://localhost:3000/center/ae87c04d-e0f2-43be-93a1-649947db30f9?locale=fr_FR"

{"id":"ae87c04d-e0f2-43be-93a1-649947db30f9","name":"test center","description":"french description","createdAt":"2022-10-11T10:50:21.772Z","updatedAt":"2022-10-11T10:51:01.371Z"}
```

We can also update the default version by not specifying the locale (or use 'default') :

```bash
curl -H "content-type: application/json" -d '{ "description": "update default local"}' -XPATCH http://localhost:3000/center/ae87c04d-e0f2-43be-93a1-649947db30f9

{"id":"ae87c04d-e0f2-43be-93a1-649947db30f9","name":"test center","description":"update default local","createdAt":"2022-10-11T10:50:21.772Z","updatedAt":"2022-10-11T10:55:40.593Z"}
```
