import axios, { AxiosResponse } from 'axios'
import { HttpClient } from '../infrastructure/persistence/http-client.js'

export class AxiosHttpClient implements HttpClient {
  async post (url: string, data: Object, config: Object): Promise<AxiosResponse> {
    return axios.post(url, data, config)
  }

  async get (url: string, config?: Object): Promise<AxiosResponse> {
    return axios.get(url, config)
  }
}
