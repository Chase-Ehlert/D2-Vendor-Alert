export interface OAuthResponse {
  render: (template: string, data: Record<string, any>) => void
  sendFile: (path: string) => void
}
