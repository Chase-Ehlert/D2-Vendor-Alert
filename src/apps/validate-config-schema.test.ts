import joi from 'joi'
import { validateSchema } from './validate-config-schema.js'
import { databaseConfigSchema } from '../infrastructure/persistence/configs/database-config-schema.js'
import { alertConfigSchema, discordConfigSchema } from '../presentation/discord/configs/discord-config-schema.js'
import { destinyConfigSchema } from '../infrastructure/destiny/config/destiny-config-schema.js'

describe('validateConfigSchema', () => {
  const expectedErrorMessage = 'bad stuff'

  it('should validate databaseConfigSchema', () => {
    const configSchemaSpy = jest.spyOn(databaseConfigSchema, 'prefs').mockReturnValue(databaseConfigSchema)
    const validateSpy = jest.spyOn(databaseConfigSchema, 'validate')
      .mockReturnValue({ value: {}, error: undefined })
    const value = validateSchema(databaseConfigSchema)

    expect(value).toStrictEqual({})
    expect(configSchemaSpy).toHaveBeenCalledWith({ errors: { label: 'key' } })
    expect(validateSpy).toHaveBeenCalled()
  })

  it('should return an error when an error exists in databaseConfigSchema', () => {
    jest.spyOn(databaseConfigSchema, 'prefs').mockReturnValue(databaseConfigSchema)
    jest.spyOn(databaseConfigSchema, 'validate')
      .mockReturnValue({
        value: undefined,
        error: new joi.ValidationError(
          expectedErrorMessage,
          [{ message: '', path: [''], type: '' }],
          {}
        )
      })

    try {
      expect(validateSchema(databaseConfigSchema)).toThrow(`Config validation error: ${expectedErrorMessage}`)
    } catch (error) {}
  })

  it('should validate discordConfigSchema', () => {
    const configSchemaSpy = jest.spyOn(discordConfigSchema, 'prefs').mockReturnValue(discordConfigSchema)
    const validateSpy = jest.spyOn(discordConfigSchema, 'validate')
      .mockReturnValue({ value: {}, error: undefined })
    const value = validateSchema(discordConfigSchema)

    expect(value).toStrictEqual({})
    expect(configSchemaSpy).toHaveBeenCalledWith({ errors: { label: 'key' } })
    expect(validateSpy).toHaveBeenCalled()
  })

  it('should return an error when an error exists in discordConfigSchema', () => {
    jest.spyOn(discordConfigSchema, 'prefs').mockReturnValue(discordConfigSchema)
    jest.spyOn(discordConfigSchema, 'validate')
      .mockReturnValue({
        value: undefined,
        error: new joi.ValidationError(
          expectedErrorMessage,
          [{ message: '', path: [''], type: '' }],
          {}
        )
      })

    try {
      expect(validateSchema(discordConfigSchema)).toThrow(`Config validation error: ${expectedErrorMessage}`)
    } catch (error) {}
  })

  it('should validate destinyConfigSchema', () => {
    const configSchemaSpy = jest.spyOn(destinyConfigSchema, 'prefs').mockReturnValue(destinyConfigSchema)
    const validateSpy = jest.spyOn(destinyConfigSchema, 'validate')
      .mockReturnValue({ value: {}, error: undefined })
    const value = validateSchema(destinyConfigSchema)

    expect(value).toStrictEqual({})
    expect(configSchemaSpy).toHaveBeenCalledWith({ errors: { label: 'key' } })
    expect(validateSpy).toHaveBeenCalled()
  })

  it('should return an error when an error exists in destinyConfigSchema', () => {
    jest.spyOn(destinyConfigSchema, 'prefs').mockReturnValue(destinyConfigSchema)
    jest.spyOn(destinyConfigSchema, 'validate')
      .mockReturnValue({
        value: undefined,
        error: new joi.ValidationError(
          expectedErrorMessage,
          [{ message: '', path: [''], type: '' }],
          {}
        )
      })

    try {
      expect(validateSchema(destinyConfigSchema)).toThrow(`Config validation error: ${expectedErrorMessage}`)
    } catch (error) {}
  })

  it('should validate alertConfigSchema', () => {
    const expectedConfig = { DISCORD_NOTIFIER_ADDRESS: '123' }
    const prefsSpy = jest.spyOn(alertConfigSchema, 'prefs').mockReturnValue(alertConfigSchema)
    const validateSpy = jest.spyOn(alertConfigSchema, 'validate')
      .mockReturnValue({ value: expectedConfig, error: undefined })
    const value = validateSchema(alertConfigSchema)

    expect(value).toStrictEqual(expectedConfig)
    expect(prefsSpy).toHaveBeenCalledWith({ errors: { label: 'key' } })
    expect(validateSpy).toHaveBeenCalled()
  })

  it('should return an error when an error exists in alertConfigSchema', () => {
    jest.spyOn(alertConfigSchema, 'prefs').mockReturnValue(alertConfigSchema)
    jest.spyOn(alertConfigSchema, 'validate')
      .mockReturnValue({
        value: undefined,
        error: new joi.ValidationError(
          expectedErrorMessage,
          [{ message: '', path: [''], type: '' }],
          {}
        )
      })

    try {
      expect(validateSchema(alertConfigSchema)).toThrow(`Config validation error: ${expectedErrorMessage}`)
    } catch (error) {}
  })
})
