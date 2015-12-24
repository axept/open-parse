# Open Parse

[![NPM Version](https://img.shields.io/npm/v/open-parse.svg)](https://npmjs.org/package/open-parse)
[![NPM Downloads](https://img.shields.io/npm/dm/open-parse.svg)](https://npmjs.org/package/open-parse)
[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/StartupMakers/open-parse.svg)](http://isitmaintained.com/project/StartupMakers/open-parse "Average time to resolve an issue")
[![Percentage of issues still open](http://isitmaintained.com/badge/open/StartupMakers/open-parse.svg)](http://isitmaintained.com/project/StartupMakers/open-parse "Percentage of issues still open")

> Open Parse = [Parse.com](https://parse.com/docs/rest/guide) + [JSON API](http://jsonapi.org/format/) + [koa](https://github.com/koajs/koa)

The collection of middleware which provides flexible RESTful API for accessing to application data store and schemas, users and security management. Save your time to bootstrap new web and mobile projects.

Open Parse is open source BaaS (Backend as a Service). On the schema below that is "Data Proccessing / Management":

![BaaS](https://backendless.com/wp-content/uploads/2014/01/baas-apis.png)

Out of the box **Open Parse** supports:

* [bunyan-logger](https://github.com/trentm/node-bunyan) which could be connected to Logentries, Loggly, NewRelic and other cloud log management services just in a 15 seconds.

* [MongoDB](https://github.com/gordonmleigh/promised-mongo) as default data provider. But you could implement custom data providers for any other databases (it takes ~20 min). 

Built with love to [Functional Principles](https://drboolean.gitbooks.io/mostly-adequate-guide/content/) and.. yes, koa.

## Content

* [How it works?](#how-it-works)
* [Installation](#installation)
* [Basic usage](#basic-usage)
* [FAQ](#faq)
  + [How to connect a Cloud Log Service?](#how-to-connect-a-cloud-log-service)
* [Inspiration](#inspiration)
* [Contribution](#contribution)
* [Roadmap](#roadmap)


## How It Works?

Open Parse is incredibly simple. It's just a glue which is connecting 2 pieces:

* *Middleware* to get RESTful API end-point on your web server. It's implemented according to [JSON API](http://jsonapi.org/) specification.
* *Data Providers* to work with any data storage (by default is MongoDB).

You can extend any of those points.

## Installation

```bash
npm install --save open-parse
```

## Basic Usage

The following example has been written with using [promised-mongo](https://github.com/gordonmleigh/promised-mongo) and [koa-router](https://github.com/alexmingoia/koa-router) packages. 

### Setup the environment
```javascript
import Router from 'koa-router';
import pmongo from 'promised-mongo';

const router = new Router();
const db = new pmongo('localhost/my-app');

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
  dataProvider: new UsersDataProvider({
    collection: db.collection('users')
  })
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
    collection: db.collection('objects'),
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
  dataProvider: new SchemasDataProvider({
    collection: db.collection('schemas')
  })
};
router.get('/schemas/:className', handleSchemaFetch(schemas));
```

### Connect the router to your application

```javascript
import koa from 'koa';
import cors from 'kcors';
import qs from 'koa-qs';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';

// Create the server instance
const app = koa();
app.use(cors());
qs(app);
app.use(bodyParser());

// ...paste your routes here...

// Connect API router
app.use(mount('/api', router));

// Go LIVE
app.listen(process.env['PORT'] || 3000);
```

### Work with Open Parse API from the browser or mobile apps

For example how to implement login in your browser scripts when you have connected Open Parse:

```javascript
const login = (email, password) => {
  const query =
    'email=' + encodeURIComponent(email)
    + '&password=' + encodeURIComponent(password);
  fetch('/api/login?' + query, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
  }).then((response) => response.json()).then((body) => {
    if (body['data']) {
      const userId = body['data']['id'];
      const userName = body['data']['attributes']['name'];
      console.log('Logged as user %s (%s)', userName, userId);
    } else {
      body['errors'].forEach(error =>
        console.error('Auth error: %s (%s)', error['title'], error['source']['parameter'])
      );
    }
  });
};
```

## FAQ

### How To Connect a Cloud Log Service?

It's really easy. Did you initialize a logger? If you didn't, let's do it right now:

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

Add just a one line to your code

```javascript
const users = {
  dataProvider: new UsersDataProvider({
    collection: db.collection('users')
  }),
  logger // THIS LINE!
};
router.post('/users', dataRequired, handleUserSignUp(users));
router.get('/login', handleUserLogin(users));
router.post('/logout', handleUserLogout(users));
router.get('/users/me', handleUserFetch(users));
```

That's all. You will get a messages (about login, logout and fetching the data about users) in your Logentries account.

# Inspiration

* [Parse.com](https://parse.com/docs/rest/guide) - Commercial Backend-as-a-Service platform
* [BaasBox API](http://www.baasbox.com/documentation/?shell#api) - Java-based open source Backend-as-a-Service solution
* [DeployD API](http://docs.deployd.com/api/) - first generation open source BaaS platform
* [Sails.js](http://sailsjs.org/documentation/concepts/) - first generation MVC framework for Node.js
* [Reindex.io](https://www.reindex.io/docs/) - Commercial BaaS platform with GraphQL API

# Contribution

Are you ready to make the world better?

**1.** Fork this repo

**2.** Checkout your repo:

```bash
git clone git@github.com:YourAccount/open-parse.git
```

**3.** Create your feature (or issue) branch:
 
```bash
git checkout -b my-new-feature
```

**4.** Commit your changes:

```bash
git commit -am 'Add some changes'
```

**5.** Push to the branch:

```bash
git push origin my-new-feature
```

**6.** [Create new pull request](https://github.com/StartupMakers/open-parse/compare)

Thank you very much. Your support is greatly appreciated.

# Roadmap

**Version 0.2**

* Support access control layer (ACL)
* Add real world example
* Improve the documentation and architecture schema
* Add 'Access-Control-Allow-Origin' header

**Version 0.3**

* Add Express middleware adapter
* Support jobs feature
* Support e-mail service

**Version 0.4**

* Add client SDK for JavaScript and React Native
* Support files feature

**Version 0.5**

* Support web hooks
