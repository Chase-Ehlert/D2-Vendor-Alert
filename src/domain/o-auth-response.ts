export interface OAuthResponse {
  render: (template: string, data: RenderGuardian) => void
  sendFile: (path: string) => void
}

interface RenderGuardian {
  guardian: string
}
