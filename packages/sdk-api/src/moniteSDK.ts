import { ApiService } from './api/ApiService';
import { apiVersion } from './api/apiVersion';
import type { MoniteFetchToken, MoniteApiUrl } from './moniteSDK.types';
import { packageVersion } from './packageVersion';

export interface MoniteSDKConfig {
  /**
   * A customer of a partner – an entity – is either an organization
   *  or an individual. Each partner develops for one or more entities.
   * With the ID of an entity is possible to obtain root access
   *  to all resources related to this specific entity only.
   *
   * `entityId` is an ID of the entity that owns the requested resource.
   *
   * @see {@link https://docs.monite.com/docs/monite-account-structure#entity} Monite Account Structure - Entity
   * @see {@link https://docs.monite.com/docs/entities} Learn how Monite API Partners can manage their customers.
   */
  entityId: string;

  /**
   *`fetchToken` responsible for generating new token
   *  or refreshing existing one.
   *
   * ## Example
   * ```typescript
   * const monite = new MoniteSDK({
   *   fetchToken: async () => {
   *     const response = await fetch('https://api.monite.dev/v1/token', {
   *       method: 'POST',
   *       headers: {
   *         'Content-Type': 'application/json',
   *       },
   *       body: JSON.stringify({
   *         grant_type: 'entity_user',
   *         client_id: 'SECRET_CLIENT_ID','
   *         client_secret: 'SECRET_CLIENT_SECRET',
   *         entity_user_id: 'SECRET_USER_ID',
   *       });
   *     });
   *
   *     return response.json();
   *   }
   * });
   * ```
   */
  fetchToken: MoniteFetchToken;

  /**
   * `apiUrl` is a base URL for all Monite API requests
   *  to make requests to dev, sandbox or production environment.
   *
   * ### Note
   * By default, `apiUrl` is set to `https://api.sandbox.monite.com/v1`
   */
  apiUrl?: MoniteApiUrl;

  /** Additional headers which you may send to Monite server */
  headers?: Record<string, string>;
}

/**
 * `MoniteSDK` is a core class of Monite SDK and Monite React Widgets.
 *
 * ## Note
 * `MoniteSDK` works only in Browser environment.
 *
 * Restrictions for working in NodeJS:
 *  - `navigator`
 */
export class MoniteSDK {
  /** Entry point to Monite API */
  public readonly api: ApiService;

  /** Provided `entityId` of the client */
  public readonly entityId: MoniteSDKConfig['entityId'];

  constructor({ apiUrl, entityId, fetchToken, headers }: MoniteSDKConfig) {
    /** Validate required parameters if the user doesn't have a TypeScript */
    if (!fetchToken || !entityId) {
      throw new Error('MoniteSDK: fetchToken and entityId are required');
    }

    this.entityId = entityId;

    this.api = new ApiService({
      BASE: apiUrl ?? 'https://api.dev.monite.com/v1',
      CREDENTIALS: 'include',
      USERNAME: undefined,
      PASSWORD: undefined,
      ENCODE_PATH: undefined,
      WITH_CREDENTIALS: false,
      fetchToken,
      token: undefined,
      HEADERS: {
        'x-monite-entity-id': entityId,
        'x-monite-version': apiVersion,
        ...headers,
        'x-monite-sdk-version': packageVersion,
      },
    });
  }
}
