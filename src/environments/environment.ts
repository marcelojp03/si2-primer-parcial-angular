// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'http://localhost:8029/api/v1',
  api: {
    baseUrl: 'http://localhost:8029/api/v1',
    wsUrl: 'ws://localhost:8029/ws',
    timeout: 30000,
    osrmBaseUrl: 'https://router.project-osrm.org',
    orsBaseUrl: 'https://api.openrouteservice.org',
    orsApiKey: '',
    routingTimeoutMs: 5000,
    routingMinIntervalMs: 30000,
    routingMinDistanceM: 50,
  },
  mock: false,
  auth: {
    tokenKey: 'access_token',
    userKey: 'auth_user',
  },
  features: {
    enableVoiceCommands: false,
    enableForecasting: false,
    enableReports: true,
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

