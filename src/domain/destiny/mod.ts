export class Mod {
  constructor (
    public readonly id: string,
    public readonly displayProperties: DisplayProperties,
    public readonly itemType: string = ''
  ) {}
}

export interface DisplayProperties {
  name: string
}

export interface Merchandise {
  itemId: string
}
