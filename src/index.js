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
