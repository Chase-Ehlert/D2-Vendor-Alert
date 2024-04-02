import { AxiosHttpClient } from './axios-http-client'
import axios from 'axios'

jest.mock('./../utility/logger', () => {
  return {
    error: jest.fn()
  }
})

describe('<AxiosHttpClient/>', () => {
  const axiosHttpClient = new AxiosHttpClient()

  it('should instantiate', () => {
    expect(axiosHttpClient).not.toBeNull()
  })

  it('should be able to make an axios post call', async () => {
    const url = 'somewhere.com'
    const data = { grant_type: 'someType' }
    const config = { headers: { 'x-api-key': 'someKey' } }
    const expectedValue = { responseType: 'json' }

    axios.post = jest.fn().mockResolvedValue(expectedValue)

    const result = await axiosHttpClient.post(url, data, config)

    expect(axios.post).toHaveBeenCalledWith(url, data, config)
    expect(result).toEqual(expectedValue)
  })

  it('should catch an error if thrown when making a post call', async () => {
    axios.post = jest.fn().mockRejectedValue(Error)

    await expect(axiosHttpClient.post('1', {}, {})).rejects.toThrow(Error)
  })

  it('should be able to make an axios get call', async () => {
    const url = 'somewhere.com'
    const config = { headers: { 'x-api-key': 'someKey' } }
    const expectedValue = { responseType: 'json' }

    axios.get = jest.fn().mockResolvedValue(expectedValue)

    const result = await axiosHttpClient.get(url, config)

    expect(axios.get).toHaveBeenCalledWith(url, config)
    expect(result).toEqual(expectedValue)
  })

  it('should catch an error if thrown when making a get call', async () => {
    axios.get = jest.fn().mockRejectedValue(Error)

    await expect(axiosHttpClient.get('1', {})).rejects.toThrow(Error)
  })
})
