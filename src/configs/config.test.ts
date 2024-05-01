import {
  ALERT_COMMAND_CONFIG,
  DEPLOY_COMMANDS_CONFIG,
  DESTINY_API_CLIENT_CONFIG,
  DISCORD_CONFIG,
  MONGO_DB_SERVICE_CONFIG
} from './config'

describe('Config', () => {
  it('should setup DESTINY_API_CLIENT_CONFIG with the correct properties', () => {
    expect(DESTINY_API_CLIENT_CONFIG).toHaveProperty('apiKey')
    expect(DESTINY_API_CLIENT_CONFIG).toHaveProperty('oauthSecret')
    expect(DESTINY_API_CLIENT_CONFIG).toHaveProperty('oauthClientId')
    expect(typeof DESTINY_API_CLIENT_CONFIG.apiKey).toBe('string')
    expect(typeof DESTINY_API_CLIENT_CONFIG.oauthSecret).toBe('string')
    expect(typeof DESTINY_API_CLIENT_CONFIG.oauthClientId).toBe('string')
  })

  it('should setup DISCORD_CONFIG with the correct properties', () => {
    expect(DISCORD_CONFIG).toHaveProperty('token')
    expect(typeof DISCORD_CONFIG.token).toBe('string')
  })

  it('should setup MONGO_DB_SERVICE_CONFIG with the correct properties', () => {
    expect(MONGO_DB_SERVICE_CONFIG).toHaveProperty('mongoUri')
    expect(typeof MONGO_DB_SERVICE_CONFIG.mongoUri).toBe('string')
  })

  it('should setup ALERT_CONFIG with the correct properties', () => {
    expect(ALERT_COMMAND_CONFIG).toHaveProperty('oauthClientId')
    expect(typeof ALERT_COMMAND_CONFIG.oauthClientId).toBe('string')
  })

  it('should setup DEPLOY_COMMANDS_CONFIG with the correct properties', () => {
    expect(DEPLOY_COMMANDS_CONFIG).toHaveProperty('token')
    expect(DEPLOY_COMMANDS_CONFIG).toHaveProperty('clientId')
    expect(typeof DEPLOY_COMMANDS_CONFIG.token).toBe('string')
    expect(typeof DEPLOY_COMMANDS_CONFIG.clientId).toBe('string')
  })
})
