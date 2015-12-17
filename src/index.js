/**
 * Copyright 2015, Startup Makers, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

import ObjectsDataProvider from './objects/data-provider';
import SchemasDataProvider from './schemas/data-provider';
import UsersDataProvider from './users/data-provider';
import {
  handleObjectsList,
  handleObjectCreate,
  handleObjectFetch,
  handleObjectUpdate,
  handleObjectDelete
} from './objects/middleware';
import {
  handleSchemaFetch
} from './schemas/middleware';
import {
  handleUserSignUp,
  handleUserLogin,
  handleUserFetch,
  handleUserLogout,
  userAuthRequired,
  userFetched
} from './users/middleware';

export {
  ObjectsDataProvider,
  handleObjectsList,
  handleObjectCreate,
  handleObjectFetch,
  handleObjectUpdate,
  handleObjectDelete,

  SchemasDataProvider,
  handleSchemaFetch,

  UsersDataProvider,
  handleUserSignUp,
  handleUserLogin,
  handleUserFetch,
  handleUserLogout,
  userAuthRequired,
  userFetched
};
