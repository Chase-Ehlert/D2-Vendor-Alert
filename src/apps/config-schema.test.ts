import joi from 'joi'
import { alertConfigSchema, notifierConfigSchema, validateSchema } from './config-schema.js'

describe('notifierConfigSchema', () => {
  const expectedErrorMessage = 'bad stuff'

  it('should validate notifierConfigSchema', () => {
    const prefsSpy = jest.spyOn(notifierConfigSchema, 'prefs').mockReturnValue(notifierConfigSchema)
    const validateSpy = jest.spyOn(notifierConfigSchema, 'validate')
      .mockReturnValue({ value: {}, error: undefined })
    const value = validateSchema(notifierConfigSchema)

    expect(value).toStrictEqual({})
    expect(prefsSpy).toHaveBeenCalledWith({ errors: { label: 'key' } })
    expect(validateSpy).toHaveBeenCalled()
  })

  it('should return an error when an error exists in notifierConfigSchema', () => {
    jest.spyOn(notifierConfigSchema, 'prefs').mockReturnValue(notifierConfigSchema)
    jest.spyOn(notifierConfigSchema, 'validate')
      .mockReturnValue({
        value: undefined,
        error: new joi.ValidationError(
          expectedErrorMessage,
          [{ message: '', path: [''], type: '' }],
          {}
        )
      })

    try {
      expect(validateSchema(notifierConfigSchema)).toThrow()
    } catch (error) {
      expect(error.message).toBe(`Config validation error: ${expectedErrorMessage}`)
    }
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
      expect(validateSchema(alertConfigSchema)).toThrow()
    } catch (error) {
      expect(error.message).toBe(`Config validation error: ${expectedErrorMessage}`)
    }
  })
})
