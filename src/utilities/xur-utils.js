
export async function getXurInventory() {
    const response = await axios.get('https://www.bungie.net/Platform/Destiny2/Vendors/', {
        params: {
            components: 402
        },
        headers: {
            'X-API-Key': `${process.env.DESTINY_API_KEY}`
        }
    })
    const inventoryNameList = await getItemFromManifest(
        3,
        Object.values(Object.values(response.Response.sales.data)[0].saleItems)
    )
    return inventoryNameList
}

async function xur() {
    let xurInventoryMessage = "Xur is selling:\r\n"
    const xurItems = await getXurInventory()
    xurItems.forEach(item => {
        xurInventoryMessage = xurInventoryMessage + item + "\r\n"
    })
    return xurInventoryMessage
}

async function aggregateFile() {
    return await getAggregatedManifestFile()
}
