Open Parse
==========

> Open Parse = [Parse.com](https://parse.com/docs/rest/guide) + [JSON API](http://jsonapi.org/format/) + [koa](https://github.com/koajs/koa)

The collection of middleware which provides REST API interface for data and schema access, users and security management.

Built with love to [Functional Principles](https://drboolean.gitbooks.io/mostly-adequate-guide/content/) and.. yes, koa.

# Basic Usage

The following example has been written with using [promised-mongo](https://github.com/gordonmleigh/promised-mongo) and [koa-router](https://github.com/alexmingoia/koa-router) packages. 

```javascript
const router = new Router();

// Users API
const users = {
  dataProvider: pmongo.collection('users')
};
router.post('/users', dataRequired, handleUserSignUp(users));
router.get('/login', handleUserLogin(users));
router.post('/logout', handleUserLogout(users));
router.get('/users/me', handleUserFetch(users));

// Classes API
const classes = {
  dataProvider: pmongo.collection('objects'),
  initialCache: require('./default-objects.json')
};
router.post('/classes/:className', dataRequired, handleObjectCreate(classes));
router.get('/classes/:className', handleObjectsList(classes));
router.get('/classes/:className/:objectId', handleObjectFetch(classes));
router.patch('/classes/:className/:objectId', dataRequired, handleObjectUpdate(classes));
router.delete('/classes/:className/:objectId', handleObjectDelete(classes));

// Schemas API
const schemas = {
  dataProvider: pmongo.collection('schemas')
};
router.get('/schemas/:className', handleSchemaFetch(schemas));

// Connect API end-point to your application
app.use('/api', router);
```

