import prepareAttributes from '../utils/prepare-attributes';

export function handleSchemaFetch({ dataProvider, logger }) {
  return function *() {
    const errors = [];
    const { params } = this;
    if (logger) {
      logger.debug('handleSchemaFetch()', params);
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
    if (errors.length === 0) {
      const fetched = yield dataProvider.fetch(className, {
        'limit': 1
      });
      if (Array.isArray(fetched)) {
        if (fetched.length > 0) {
          this.body = {
            'data': {
              'type': 'schema',
              'id': className,
              'attributes': prepareAttributes(fetched[0])
            }
          };
          return;
        }
        errors.push({
          'title': 'entry is not found',
          'source': {
            'parameter': 'className'
          }
        });
      } else {
        errors.push({
          'title': 'could not fetch schema',
          'source': {
            'parameter': 'className'
          }
        });
      }
    }
    this.body = {
      'errors': errors
    };
  }
}
