export class DestinyResponse {
  constructor (public readonly destinyResponse: DestinyUsername) {}
}

export interface DestinyUsername {
  name: string
}
