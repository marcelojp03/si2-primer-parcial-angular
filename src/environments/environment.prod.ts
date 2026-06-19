export const environment = {
  production: true,
  baseUrl: 'https://j4mtwusjdr.us-east-1.awsapprunner.com/api/v1',
  api: {
    baseUrl: 'https://j4mtwusjdr.us-east-1.awsapprunner.com/api/v1',
    wsUrl: 'wss://j4mtwusjdr.us-east-1.awsapprunner.com/ws',
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

