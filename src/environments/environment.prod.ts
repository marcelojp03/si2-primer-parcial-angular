export const environment = {
  production: true,
  baseUrl: 'https://j4mtwusjdr.us-east-1.awsapprunner.com/api/v1',
  api: {
    baseUrl: 'https://j4mtwusjdr.us-east-1.awsapprunner.com/api/v1',
    timeout: 30000,
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

