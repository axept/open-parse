/**
 * Copyright 2015, Startup Makers, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';
import bcrypt from 'bcrypt';

function encodePassword(password) {
  return bcrypt.hashSync(password, 10);
}
function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export default class UsersDataProvider {
  /**
   * @param {Object} collection like MongoDB
   * @param {Object} logger
   * @param {Object} [initialCache] a cache hash in format `cache[className]`
   */
  constructor({ logger, collection, initialCache }) {
    this.logger = logger;
    this.collection = collection;
    this._cache = Object.assign({}, initialCache);
  }

  /**
   * @param {Object} data
   * @returns {{objectId: number, createdAt: number}|boolean}
   */
  async insert(data) {
    const createdTime = Date.now();
    const document = Object.assign({}, data, {
      'createdAt': createdTime,
      'password': encodePassword(data['password'])
    });
    if (this.logger) {
      this.logger.debug('try to insert by insert()', document);
    }
    let created;
    try {
      created = await this.collection.insert(document);
    } catch (err) {
      if (this.logger) {
        this.logger.error('could not insert by create()', {
          'document': document,
          'errors': err
        });
      }
    }
    if (typeof created === 'object') {
      return {
        objectId: created['_id'],
        createdAt: createdTime
      };
    }
    return false;
  }

  /**
   * @param {object} criteria
   * @param {string} [criteria.objectId]
   * @param {string} [criteria.password]
   * @returns {object|boolean} data or `false`
   */
  async findOne(criteria) {
    const finalCriteria = Object.assign({}, criteria);
    if (typeof finalCriteria['objectId'] !== 'undefined') {
      finalCriteria['_id'] = this.collection.ObjectId(finalCriteria['objectId']);
      delete finalCriteria['objectId'];
    }
    let password;
    if (typeof finalCriteria['password'] !== 'undefined') {
      password = finalCriteria['password'];
      delete finalCriteria['password'];
    }
    if (this.logger) {
      this.logger.debug('try to fetch by findOne()', {
        'criteria': finalCriteria
      });
    }
    const foundUser = await this.collection.findOne(finalCriteria);
    if (foundUser && typeof password !== 'undefined') {
      const isValidPassword = await comparePassword(password, foundUser['password']);
      if (!isValidPassword) {
        if (this.logger) {
          this.logger.debug('specified password is not valid', {
            'password': password,
            'original': foundUser['password']
          });
        }
        return false;
      }
    }
    if (foundUser === null) {
      return false;
    }
    const result = Object.assign({}, foundUser);
    if (typeof result['_id'] !== 'undefined') {
      result['objectId'] = result['_id'];
      delete result['_id'];
    }
    return result;
  }

  /**
   * @param {object} criteria
   * @param {string} [criteria.objectId]
   * @param {object} changes
   * @returns {{updatedAt: number}|boolean}
   */
  async update(criteria, changes) {
    const updatedTime = Date.now();
    const finalCriteria = Object.assign({}, criteria);
    if (typeof finalCriteria['objectId'] !== 'undefined') {
      finalCriteria['_id'] = this.collection.ObjectId(finalCriteria['objectId']);
      delete finalCriteria['objectId'];
    }
    const finalChanges = Object.assign({}, changes, {
      'updatedAt': updatedTime
    });
    if (this.logger) {
      this.logger.debug('try to update by update()', {
        'criteria': finalCriteria,
        'changes': finalChanges
      });
    }
    let writeResult;
    try {
      writeResult = await this.collection.update(finalCriteria, {
        '$set': finalChanges
      }, { multi: true });
    } catch (err) {
      if (this.logger) {
        this.logger.debug('could not update by update()', {
          'criteria': finalCriteria,
          'error': err
        });
      }
    }
    if (typeof writeResult !== 'undefined') {
      return {
        updatedAt: updatedTime
      };
    } else {
      return false;
    }
  }
};
