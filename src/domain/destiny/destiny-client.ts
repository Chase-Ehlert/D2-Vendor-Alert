import { Mod } from './mod.js'

export interface DestinyClient {
  getCollectibleInfo: (destinyId: string) => Promise<String[]>
  getVendorInfo: (
    destinyId: string,
    destinyCharacterId: string,
    refreshToken: string
  ) => Promise<string[]>
  getDestinyEquippableMods: () => Promise<Mod[]>
}
