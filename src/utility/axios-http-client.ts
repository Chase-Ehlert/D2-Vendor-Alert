import axios from 'axios'
import { HttpClient } from './http-client'

export class AxiosHttpClient implements HttpClient {
  async post (url: string, data: Object, config: Object): Promise<any> {
    return await axios.post(url, data, config)
  }

  async get (url: string, config?: Object): Promise<any> {
    return await axios.get(url, config)
  }
}
