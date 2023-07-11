export class Vendor {
    constructor(destinyService, databaseRepo, manifestService) {
        this.destinyService = destinyService;
        this.databaseRepo = databaseRepo;
        this.manifestService = manifestService;
    }
    /**
     * Collect mods for sale by Ada-1
     */
    async getProfileCollectibles(user) {
        const adaVendorId = '350061650';
        const collectibleId = 65;
        const collectibleList = [];
        await Promise.all([
            this.destinyService.getDestinyCollectibleInfo(user.destinyId),
            this.getVendorModInventory(user, adaVendorId)
        ]).then((values) => {
            // const modsForSale = values[1].join(', ')
            // console.log(`Ada has these mods for sale: ${modsForSale}`)
            values[1].forEach((key) => {
                if (values[0][key].state === collectibleId) {
                    collectibleList.push(key);
                }
            });
        });
        return await this.manifestService.getCollectibleFromManifest(19, collectibleList);
    }
    /**
     * Collect mods for a specific vendor
     */
    async getVendorModInventory(user, vendorId) {
        const tokenInfo = await this.destinyService.getAccessToken(user.refreshToken);
        await this.databaseRepo.updateUserByMembershipId(tokenInfo.bungieMembershipId, tokenInfo.refreshTokenExpirationTime, tokenInfo.refreshToken);
        let vendorInventory;
        if (tokenInfo.accessToken !== undefined) {
            const vendorInfo = await this.destinyService.getDestinyVendorInfo(user, tokenInfo.accessToken);
            for (const key in vendorInfo) {
                if (key === vendorId) {
                    vendorInventory = vendorInfo[key].saleItems;
                }
            }
            return await this.manifestService.getItemFromManifest(19, vendorInventory);
        }
        else {
            throw Error('Missing access token for retreiving vendor mod inventory.');
        }
    }
}
//# sourceMappingURL=vendor.js.map