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
 * Convert reserved dates to ISO format and remove `objectId` field
 * @param {Object} data
 * @returns {Object} of prepared attributes
 */
export default function prepareAttributes(data) {
  const result = Object.assign({}, data);
  delete result['objectId'];
  // Apply ISO Dates
  const keysForISODate = ['createdAt', 'updatedAt', 'deletedAt'];
  keysForISODate.forEach(key => {
    if (typeof result[key] !== 'undefined') {
      const formatted = new Date(result[key]).toISOString();
      if (!isNaN(formatted)) {
        result[key] = formatted;
      }
    }
  });
  // Push it back
  return result;
}
