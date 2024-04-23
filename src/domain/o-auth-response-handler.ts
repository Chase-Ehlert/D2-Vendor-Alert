export interface OAuthResponseHandler {
  render: (template: string, data: Record<string, any>) => void
  sendFile: (path: string) => void
}
