import { AxiosHttpClient } from './axios-http-client'
import axios from 'axios'

describe('AxiosHttpClient', () => {
  const axiosHttpClient = new AxiosHttpClient()

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

  it('should be able to make an axios get call', async () => {
    const url = 'somewhere.com'
    const config = { headers: { 'x-api-key': 'someKey' } }
    const expectedValue = { responseType: 'json' }

    axios.get = jest.fn().mockResolvedValue(expectedValue)

    const result = await axiosHttpClient.get(url, config)

    expect(axios.get).toHaveBeenCalledWith(url, config)
    expect(result).toEqual(expectedValue)
  })
})
