# Open Parse

[![NPM Version](https://img.shields.io/npm/v/open-parse.svg)](https://npmjs.org/package/open-parse)
[![NPM Downloads](https://img.shields.io/npm/dm/open-parse.svg)](https://npmjs.org/package/open-parse)
[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/StartupMakers/open-parse.svg)](http://isitmaintained.com/project/StartupMakers/open-parse "Average time to resolve an issue")
[![Percentage of issues still open](http://isitmaintained.com/badge/open/StartupMakers/open-parse.svg)](http://isitmaintained.com/project/StartupMakers/open-parse "Percentage of issues still open")

> Open Parse = [Parse.com](https://parse.com/docs/rest/guide) + [JSON API](http://jsonapi.org/format/) + [koa](https://github.com/koajs/koa)

The collection of middleware which provides REST API interface for accessing to application data and schema, users and security management.

Out of the box it supports [bunyan-logger](https://github.com/trentm/node-bunyan) which could be connected to Logentries, Loggly, NewRelic and other cloud log management services just in a 15 seconds.

Built with love to [Functional Principles](https://drboolean.gitbooks.io/mostly-adequate-guide/content/) and.. yes, koa.

## Content

* [Basic Usage](#basic-usage)
* [How To Connect a Cloud Log Service](#how-to-connect-a-cloud-log-service)
* [Roadmap](#roadmap)


## Basic Usage

The following example has been written with using [promised-mongo](https://github.com/gordonmleigh/promised-mongo) and [koa-router](https://github.com/alexmingoia/koa-router) packages. 

### Prepare new router and utils
```javascript
const router = new Router();
const dataRequired = function *(next) {
  if (typeof this.request.body['data'] === 'object') {
    yield next;
  } else {
    this.throw(400, 'Request data is required');
  }
};
```

### Bring up Users API
```javascript
const users = {
  dataProvider: pmongo.collection('users')
};
router.post('/users', dataRequired, handleUserSignUp(users));
router.get('/login', handleUserLogin(users));
router.post('/logout', handleUserLogout(users));
router.get('/users/me', handleUserFetch(users));
```

### Bring up Classes API

In this example we're using a local data from JSON file.

```javascript
const classes = {
  dataProvider: new ObjectsDataProvider({
    collection: pmongo.collection('objects'),
    initialCache: require('./cached-objects.json')
  }),
};
router.post('/classes/:className', dataRequired, handleObjectCreate(classes));
router.get('/classes/:className', handleObjectsList(classes));
router.get('/classes/:className/:objectId', handleObjectFetch(classes));
router.patch('/classes/:className/:objectId', dataRequired, handleObjectUpdate(classes));
router.delete('/classes/:className/:objectId', handleObjectDelete(classes));
```

For `ObjectsDataProvider` an initial cache should be specified as a `[className][objectId]` hash object:
  
`cached-objects.json`
```
{ 
  "company": {
    "our": {
      "title": "Startup Makers",
      "about": "We are consulting and outsourcing a web-development with cutting-edge JavaScript technologies (ES6, Node.js, React, Redux, koa)"
    }
  }
}
```

### Bring up Schemas API

```javascript
const schemas = {
  dataProvider: pmongo.collection('schemas')
};
router.get('/schemas/:className', handleSchemaFetch(schemas));
```

### Connect the router to your application
```javascript
app.use('/api', router);
```

### How to connect any cloud log service?

It's really easy:

#### Configure a logger

Only if you didn't initialize that in your application earlier.

```javascript 
import bunyan from 'bunyan';
import { LogentriesBunyanStream } from 'bunyan-logentries';

const logger = bunyan.createLogger({
  name: 'awesome-app',
  streams: {
    stream: new LogentriesBunyanStream({
      token: process.env['LOGENTRIES_TOKEN']
    }),
    level: 'debug',
    type: 'raw'
  }
});
```

# How To Connect a Cloud Log Service 

Add just a one line of code:

```javascript
const users = {
  dataProvider: pmongo.collection('users'),
  logger // this!
};
router.post('/users', dataRequired, handleUserSignUp(users));
router.get('/login', handleUserLogin(users));
router.post('/logout', handleUserLogout(users));
router.get('/users/me', handleUserFetch(users));
```

# Roadmap

**Version 0.3**

* Support jobs feature
* Support e-mail service

**Version 0.4**

* Support files feature

**Version 0.5**

* Support web hooks