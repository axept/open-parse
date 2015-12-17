/**
 * Copyright 2015, Startup Makers, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

export default class SchemasDataProvider {
  /**
   * @param {Object} collection is MongoDB collection
   * @param {Object} [logger]
   * @param {Object} [initialCache] a cache hash in format `cache[className]`
   */
  constructor({ collection, logger, initialCache }) {
    this.collection = collection;
    this.logger = logger;
    this._cache = Object.assign({}, initialCache);
  }

  /**
   * @param {Object|String} criteria is filter set or className
   * @param {String} [criteria.className]
   * @param {Object} [options] custom params
   * @param {Boolean} [options.cache=true]
   * @param {Number} [options.skip=0]
   * @param {Number} [options.limit=100]
   * @returns {Array.<*>}
   */
  async fetchObjects(criteria, options) {
    let finalOptions = Object.assign({
      cache: true,
      skip: 0,
      limit: 100
    }, options);
    let finalCriteria;
    if (typeof criteria === 'string') {
      finalCriteria = {
        'className': criteria
      };
    } else {
      finalCriteria = Object.assign({}, criteria);
    }
    // try to fetch from local cache
    if (finalOptions.cache && finalCriteria['className']) {
      const className = finalCriteria['className'];
      if (this._cache[className]) {
        return [this._cache[className]];
      }
    }
    // otherwise fetch from database
    if (typeof finalCriteria['objectId'] !== 'undefined') {
      try {
        finalCriteria['_id'] = this.collection.ObjectId(finalCriteria['objectId']);
      } catch (err) {
        if (this.logger) {
          this.logger.error('could not parse `objectId` in fetchObjects()', {
            'objectId': finalCriteria['objectId'],
            'error': err
          });
        }
        return false;
      }
      delete finalCriteria['objectId'];
    }
    if (this.logger) {
      this.logger.debug('find by fetchObjects()', {
        'criteria': finalCriteria,
        'options': finalOptions
      });
    }
    let result;
    try {
      const cursor = await this.collection.find(finalCriteria);
      result = cursor.limit(finalOptions.limit)
        .skip(finalOptions.skip)
        .toArray();
      if (this.logger) {
        this.logger.debug('found by fetchObjects()', {
          'count': result.length
        });
      }
    } catch (err) {
      if (this.logger) {
        this.logger.error('could not find by fetchObjects()', {
          'criteria': finalCriteria,
          'error': err
        });
      }
    }
    if (typeof result !== 'undefined') {
      return result;
    }
    return false;
  }

  /**
   * @param {String} className
   * @returns {Object|Boolean} data or false
   */
  async fetchObject(className) {
    const found = await this.fetch({
      'className': className
    }, {
      'limit': 1
    });
    if (typeof found === 'object' && found[0]) {
      return found[0];
    }
    return false;
  }
}
