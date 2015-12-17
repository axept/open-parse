
export default class ObjectsDataProvider {
  /**
   * @param {Object} collection is MongoDB collection
   * @param {Object} [logger]
   * @param {Object} [initialCache] a cache hash in format `cache[className][objectId]`
   */
  constructor({ collection, logger, initialCache }) {
    this.collection = collection;
    this.logger = logger;
    this._cache = Object.assign({}, initialCache);
  }

  /**
   * @param {string} className
   * @param {object} data
   * @returns {{objectId: number, createdAt: number}|boolean}
   */
  async createObject(className, data) {
    const createdTime = Date.now();
    const document = Object.assign({}, data, {
      'className': className,
      'createdAt': createdTime
    });
    if (this.logger) {
      this.logger.debug('insert by createObject()', {
        'document': document
      });
    }
    let created;
    try {
      created = await this.collection.insert(document);
    } catch (err) {
      if (this.logger) {
        this.logger.error('could not insert by createObject()', {
          'document': document,
          'error': err
        });
      }
    }
    if (typeof created === 'object') {
      return {
        'objectId': created['_id'],
        'createdAt': createdTime
      };
    }
    return false;
  }

  /**
   * @param {object|string} criteria is filter set or className
   * @param {string} [criteria.className]
   * @param {string} [criteria.objectId]
   * @param {object} [options] custom options or object id
   * @param {boolean} [options.cache=true]
   * @param {number} [options.skip=0]
   * @param {number} [options.limit=100]
   * @returns {Array.<*>|boolean}
   */
  async fetchObjects(criteria, options) {
    const finalOptions = {
      cache: true,
      skip: 0,
      limit: 100
    };
    let finalCriteria;
    if (typeof arguments[0] === 'string') {
      finalCriteria = {
        'className': arguments[0],
        'objectId': arguments[1]
      };
    } else {
      finalCriteria = Object.assign({}, criteria);
      Object.assign(finalOptions, options);
    }
    // try to fetch data from local cache and return it
    if (finalOptions.cache && finalCriteria['className'] && finalCriteria['objectId']) {
      const className = finalCriteria['className'];
      const objectId = finalCriteria['objectId'];
      if (this._cache[className] && this._cache[className][objectId]) {
        return [this._cache[className][objectId]];
      }
    }
    // otherwise fetch data from database
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
      result = await this.collection.find(finalCriteria)
        .limit(finalOptions['limit'])
        .skip(finalOptions['skip'])
        .toArray();
      // Reduce as mutable data to optimize it
      result.forEach((it) => {
        it['objectId'] = it['_id'];
        delete it['_id'];
      });
      if (this.logger) {
        this.logger.debug('found by fetchObjects()', {
          count: result.length
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
   * @param {String} objectId
   * @returns {Object|Boolean} data or false
   */
  async fetchObject(className, objectId) {
    const found = await this.fetchObjects({
      'className': className,
      'objectId': objectId
    }, {
      'limit': 1
    });
    if (typeof found === 'object' && found[0]) {
      return found[0];
    }
    return false;
  }

  /**
   * @param {Object} criteria
   * @param {String} [criteria.className]
   * @param {String} [criteria.objectId]
   * @param {Object} data
   * @returns {{updatedAt: number}|Boolean}
   */
  async updateObject(criteria, data) {
    const updatedTime = Date.now();
    const finalCriteria = Object.assign({}, criteria);
    if (typeof finalCriteria['objectId'] !== 'undefined') {
      finalCriteria['_id'] = this.collection.ObjectId(finalCriteria['objectId']);
      delete finalCriteria['objectId'];
    }
    const changes = Object.assign({}, data, {
      'updatedAt': updatedTime
    });
    if (this.logger) {
      this.logger.debug('update by updateObject()', {
        'criteria': finalCriteria,
        'changes': changes
      });
    }
    let writeResult;
    try {
      writeResult = await this.collection.update(finalCriteria, {
        '$set': changes
      }, { multi: true });
    } catch (err) {
      if (this.logger) {
        this.logger.error('could not update by updateObject()', {
          'criteria': finalCriteria,
          'changes': changes,
          'error': err
        });
      }
    }
    if (typeof writeResult !== 'undefined') {
      return {
        updatedAt: updatedTime
      };
    }
    return false;
  }

  /**
   * @param {Object} params
   * @param {String} params.className
   * @param {String} params.objectId
   * @returns {{updatedAt: Number}|Boolean}
   */
  async deleteObject({ className, objectId }) {
    const deletedTime = Date.now();
    const criteria = {
      'className': className,
      'objectId': objectId
    };
    const updated = await this.updateObject(criteria, {
      'deletedAt': deletedTime
    });
    if (typeof updated === 'object' && updated['updatedAt']) {
      return {
        'deletedAt': deletedTime
      }
    }
    return false;
  }
}
