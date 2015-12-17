/**
 * Copyright 2015, Startup Makers, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

/**
 * @param {Object} dataProvider
 * @param {Object} [logger]
 * @param [loginField=email]
 * @param [loginIfSuccess=true]
 * @returns {Function}
 */
export function handleUserSignUp({ dataProvider, logger, loginField, loginIfSuccess }) {
  return function *() {
    const body = this.request['body'];
    const request = (body['data'] && body['data']['attributes']) || {};
    const errors = [];
    // Validate request attributes
    // @todo yield schemasCollection.fetchOne('UserRegistration');
    //if (!attributes['name']) {
    //  errors.push({
    //    'title': 'Please fill out this field',
    //    'source': {
    //      'parameter': 'name'
    //    }
    //  });
    //}
    const finalLoginField = loginField || 'email';
    if (!request[finalLoginField]) {
      errors.push({
        'title': 'Required field is missing',
        'source': {
          'parameter': finalLoginField
        }
      });
    }
    if (!request['password']) {
      errors.push({
        'title': 'Required field is missing',
        'source': {
          'parameter': 'password'
        }
      });
    }
    if (errors.length === 0) {
      let createdUser;
      try {
        const document = Object.assign({}, request);
        createdUser = yield dataProvider.insert(document);
        if (logger) {
          logger.debug('created new user by handleUserLogin()', createdUser);
        }
      } catch (err) {
        if (logger) {
          logger.error('failed to create new user by handleUserLogin()', {
            'error': err
          });
        }
      }

      if (typeof createdUser === 'object') {
        if (loginIfSuccess !== false) {
          this.session['userId'] = createdUser['objectId'];
        }
        this.status = 201;
        this.body = {
          'data': [{
            'type': 'users',
            'id': createdUser['objectId'],
            'attributes': {
              'created_at': (new Date(createdUser['createdAt'])).toISOString()
            }
          }]
        };
        //this.redirect('/users/' + createdUser['id']);
        return;
      }

      errors.push({
        'title': 'The user is already existing',
        'source': {
          'parameter': finalLoginField
        }
      });
    }
    this.body = {
      'errors': errors
    };
  };
}

/**
 * @param {Object} dataProvider
 * @param {String} loginField
 * @returns {Function}
 */
export function handleUserLogin({ dataProvider, loginField }) {
  return function *() {
    const errors = [];
    const { query } = this;
    if (typeof query[loginField] !== 'string' || query[loginField].trim() === '') {
      errors.push({
        'title': 'Please fill out this field',
        'source': {
          'parameter': loginField
        }
      });
    }
    if (typeof query['password'] !== 'string' || query['password'].trim() === '') {
      errors.push({
        'title': 'Please fill out this field',
        'source': {
          'parameter': 'password'
        }
      });
    }
    if (errors.length === 0) {
      const foundUser = yield dataProvider.findOne({
        'email': query['email'],
        'password': query['password']
      });

      if (typeof foundUser === 'object' && foundUser !== null) {
        const userId = foundUser['objectId'];
        this.session['userId'] = userId;

        // Prepare fetched data for response
        const attributes = Object.assign({}, foundUser);
        delete attributes['objectId'];
        delete attributes['password'];

        this.body = {
          'data': {
            'type': 'users',
            'id': userId,
            'attributes': attributes
          }
        };
        return;
      }

      errors.push({
        'title': 'Invalid login or password',
        'source': {
          'parameter': 'email'
        }
      });
    }
    this.body = {
      'errors': errors
    };
  };
}

/**
 * Fetch user specified in params['id'] or just current user
 * @param {Object} dataProvider
 * @returns {Function}
 */
export function handleUserFetch({ dataProvider }) {
  return function *() {
    const errors = [];
    const { params, session } = this;
    const userId = params['id'] || (session && session['userId']);
    if (userId) {
      const foundUser = yield dataProvider.findOne({
        'objectId': userId
      });
      if (typeof foundUser === 'object' && foundUser !== null) {
        const attributes = Object.assign({}, foundUser);
        delete attributes['objectId'];
        delete attributes['password'];

        this.body = {
          'data': {
            'type': 'users',
            'id': this.session['userId'],
            'attributes': attributes
          }
        };
        return;
      }
      errors.push({
        'title': 'The user is not found'
      });
    } else {
      errors.push({
        'title': 'The user is not logged in'
      });
    }
    this.body = {
      'errors': errors
    };
  };
}

/**
 * @returns {Function}
 */
export function handleUserLogout() {
  return function *() {
    const { session } = this;
    if (session && session['userId']) {
      const userId = session['userId'];
      this.session = null;
      this.body = {
        'data': {
          'type': 'users',
          'id': userId
        }
      };
      return;
    }
    this.body = {
      'errors': [{
        'title': 'The user is not logged in yet'
      }]
    };
  }
}

/**
 * @param {Object} dataProvider
 * @returns {Function}
 */
export function userFetched({ dataProvider }) {
  return function *() {
    const { session } = this;
    if (session && session['userId']) {
      const foundUser = yield dataProvider.findOne({
        'objectId': session['userId']
      });
      const me = Object.assign({}, foundUser);
      delete me['password'];
      this.me = me;
    } else {
      this.me = {};
    }
  };
}

/**
 * @param {String} [loginView] i.e. 'login-page'
 * @param {String} [loginURL] i.e. '/login'
 * @returns {Function}
 */
export function userAuthRequired({ loginView, loginURL }) {
  return function *() {
    if (typeof this.session['userId']) {
      yield next;
    } else {
      if (loginView) {
        yield this.render(loginView, {
          'forwardURL': this.request.url
        });
      }
      if (loginURL) {
        this.redirect(loginURL);
      }
    }
  };
}
