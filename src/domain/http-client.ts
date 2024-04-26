export interface HttpClient {
  post: (url: string, data: Object, config: Object) => Promise<any>
  get: (url: string, config?: Object) => Promise<any>
}
