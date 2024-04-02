import axios, { AxiosResponse } from 'axios'
import { HttpClient } from './http-client'
import logger from './logger.js'

export class AxiosHttpClient implements HttpClient {
  async post (url: string, data: Object, config: Object): Promise<AxiosResponse> {
    try {
      return await axios.post(url, data, config)
    } catch (error) {
      logger.error(error)
      throw new Error('Axios http post call failed')
    }
  }

  async get (url: string, config?: Object): Promise<AxiosResponse> {
    try {
      return await axios.get(url, config)
    } catch (error) {
      logger.error(error)
      throw new Error('Axios http get call failed')
    }
  }
}
