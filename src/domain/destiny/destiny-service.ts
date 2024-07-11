import { Mod } from './mod.js'

export interface DestinyService {
  getUnownedModIds: (destinyId: string) => Promise<String[]>
  getVendorMerchandise: (
    destinyId: string,
    destinyCharacterId: string,
    refreshToken: string
  ) => Promise<Map<string, Map<string, Mod>>>
  getEquippableMods: () => Promise<Mod[]>
}
