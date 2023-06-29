import { DatabaseRepository } from './database/database-repository.js';
import { ManifestService } from './services/manifest-service.js';
import { DestinyService } from './services/destiny-service.js';
const destinyService = new DestinyService();
const databaseRepo = new DatabaseRepository();
const manifestService = new ManifestService();
export class Vendor {
    /**
     * Collect mods for a specific vendor
     */
    async getVendorModInventory(user, vendorId) {
        const tokenInfo = await destinyService.getAccessToken(user.refreshToken);
        await databaseRepo.updateUser(tokenInfo.bungieMembershipId, tokenInfo.refreshTokenExpirationTime, tokenInfo.refreshToken);
        let vendorInventory;
        if (tokenInfo.accessToken !== undefined) {
            const vendorInfo = await destinyService.getDestinyVendorInfo(user, tokenInfo.accessToken);
            for (const key in vendorInfo) {
                if (key === vendorId) {
                    vendorInventory = vendorInfo[key].saleItems;
                }
            }
        }
        return await manifestService.getItemFromManifest(19, vendorInventory);
    }
    /**
     * Collect mods for sale by Ada-1
     */
    async getProfileCollectibles(user) {
        const adaVendorId = '350061650';
        const collectibleId = 65;
        const collectibleList = [];
        await Promise.all([
            destinyService.getDestinyCollectibleInfo(user.destinyId),
            this.getVendorModInventory(user, adaVendorId)
        ]).then((values) => {
            const modsForSale = values[1].join(', ');
            console.log(`Ada has these mods for sale: ${modsForSale}`);
            values[1].forEach((key) => {
                if (values[0][key].state === collectibleId) {
                    collectibleList.push(key);
                }
            });
        });
        return await manifestService.getCollectibleFromManifest(19, collectibleList);
    }
}
//# sourceMappingURL=vendor.js.map