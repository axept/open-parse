import prepareAttributes from '../utils/prepare-attributes';

const RESOURCE_TYPE_PREFIX = 'object_';

/**
 * @param {Object} dataProvider
 * @param {Object} [logger]
 * @returns {Function}
 */
export function handleObjectsList({ dataProvider, logger }) {
  return function *() {
    const errors = [];
    const { params } = this;
    if (logger) {
      logger.debug('handleObjectsList()', params);
    }
    const className = params['className'];
    if (typeof className === 'undefined' || className === '') {
      errors.push({
        'title': 'Required field is missing',
        'source': {
          'parameter': 'className'
        }
      });
    }
    if (errors.length === 0) {
      const criteria = {};
      const { query } = this;
      if (typeof query['filter'] === 'object') {
        const filter = query['filter'];
        Object.keys(filter).forEach(key => {
          if (key.indexOf('$') === -1) {
            criteria[key] = filter[key];
          }
        });
      }
      criteria['className'] = className;
      const fetched = yield dataProvider.fetchObjects(criteria);
      if (Array.isArray(fetched)) {
        this.body = {
          'data': fetched.map(it => {
            return {
              'type': RESOURCE_TYPE_PREFIX + className,
              'id': it['objectId'],
              'attributes': prepareAttributes(it)
            };
          })
        };
        return;
      }
      errors.push({
        'title': 'could not fetch objects',
        'source': {
          'parameter': 'className'
        }
      });
    }
    this.body = {
      'errors': errors
    };
  }
}

/**
 * @param {Object} dataProvider
 * @param {Object} [logger]
 * @returns {Function}
 */
export function handleObjectCreate({ dataProvider, logger }) {
  return function *() {
    const errors = [];
    const body = this.request['body'];
    const { params } = this;
    if (logger) {
      logger.debug('handleObjectCreate()', params);
    }
    const incomingAttributes = (body['data'] && body['data']['attributes']) || {};
    const className = params['className'];
    if (typeof className === 'undefined' || className === '') {
      errors.push({
        'title': 'required field is not specified',
        'source': {
          'parameter': 'className'
        }
      });
    }
    if (errors.length === 0) {
      const data = Object.assign({}, incomingAttributes, {
        'createdBy': this.session['userId']
      });
      const created = yield dataProvider.createObject(className, data);
      if (typeof created === 'object') {
        this.body = {
          'data': {
            'type': RESOURCE_TYPE_PREFIX + className,
            'id': created['objectId'],
            'attributes': prepareAttributes(created)
          }
        };
        return;
      }
      errors.push({
        'title': 'could not create object',
        'source': {
          'parameter': 'objectId'
        }
      });
    }
    this.body = {
      'errors': errors
    };
  }
}

/**
 * @param {Object} dataProvider
 * @param {Object} [logger]
 * @returns {Function}
 */
export function handleObjectFetch({ dataProvider, logger }) {
  return function *() {
    const errors = [];
    const { params } = this;
    if (logger) {
      logger.debug('handleObjectUpdate()', params);
    }
    const className = params['className'];
    if (typeof className === 'undefined' || className === '') {
      errors.push({
        'title': 'required field is missing',
        'source': {
          'parameter': 'className'
        }
      });
    }
    const objectId = params['objectId'];
    if (typeof objectId === 'undefined' || objectId === '') {
      errors.push({
        'title': 'required field is missing',
        'source': {
          'parameter': 'objectId'
        }
      });
    }
    if (errors.length === 0) {
      const fetched = yield dataProvider.fetchObjects({
        'className': className,
        'objectId': objectId
      }, {
        'limit': 1
      });
      if (Array.isArray(fetched)) {
        if (fetched.length > 0) {
          this.body = {
            'data': {
              'type': RESOURCE_TYPE_PREFIX + className,
              'id': fetched[0]['objectId'],
              'attributes': prepareAttributes(fetched[0])
            }
          };
          return;
        }
        errors.push({
          'title': 'entry is not found',
          'source': {
            'parameter': 'objectId'
          }
        });
      } else {
        errors.push({
          'title': 'could not fetch object',
          'source': {
            'parameter': 'objectId'
          }
        });
      }
    }
    this.body = {
      'errors': errors
    };
  }
}

/**
 * @param {Object} dataProvider
 * @param {Object} [logger]
 * @returns {Function}
 */
export function handleObjectUpdate({ dataProvider, logger }) {
  return function *() {
    const errors = [];
    const body = this.request['body'];
    const { params } = this;
    if (logger) {
      logger.debug('handleObjectUpdate()', params);
    }
    const incomingAttributes = (body['data'] && body['data']['attributes']) || {};
    const className = params['className'];
    if (typeof className === 'undefined' || className === '') {
      errors.push({
        'title': 'required field is missing',
        'source': {
          'parameter': 'className'
        }
      });
    }
    const objectId = params['objectId'];
    if (typeof objectId === 'undefined' || objectId === '') {
      errors.push({
        'title': 'required field is missing',
        'source': {
          'parameter': 'objectId'
        }
      });
    }
    if (errors.length === 0) {
      const updated = yield dataProvider.update({
        'className': className,
        'objectId': objectId
      }, incomingAttributes);
      if (typeof updated === 'object' && updated !== null) {
        this.body = {
          'data': {
            'type': RESOURCE_TYPE_PREFIX + className,
            'id': updated['objectId'],
            'attributes': prepareAttributes(updated)
          }
        };
        return;
      }
      errors.push({
        'title': 'could not update object',
        'source': {
          'parameter': 'objectId'
        }
      });
    }
    this.body = {
      'errors': errors
    };
  }
}

/**
 * @param {Object} dataProvider
 * @param {Object} [logger]
 * @returns {Function}
 * @APIBlueprint
 * + Response 200 (application/json)
 *     {
 *       "data": {
 *          "type": "object",
 *          "attributes": {
 *            "deletedAt": "2015-06-11T08:40:51.620Z"
 *          }
 *       }
 *     }
 */
export function handleObjectDelete({ dataProvider, logger }) {
  return function *() {
    const errors = [];
    const { params } = this;
    if (logger) {
      logger.debug('handleObjectDelete()', params);
    }
    const className = params['className'];
    if (typeof className === 'undefined' || className === '') {
      errors.push({
        'title': 'required field is missing',
        'source': {
          'parameter': 'className'
        }
      });
    }
    const objectId = params['objectId'];
    if (typeof objectId === 'undefined' || objectId === '') {
      errors.push({
        'title': 'required field is missing',
        'source': {
          'parameter': 'objectId'
        }
      });
    }
    if (errors.length === 0) {
      const deleted = yield dataProvider.deleteObject({
        'className': className,
        'objectId': objectId
      });
      if (typeof deleted === 'object') {
        this.body = {
          'data': {
            'type': RESOURCE_TYPE_PREFIX + className,
            'attributes': prepareAttributes(deleted)
          }
        };
        return;
      }
      errors.push({
        'title': 'could not delete object',
        'source': {
          'parameter': 'objectId'
        }
      });
    }
    this.body = {
      'errors': errors
    };
  }
}
