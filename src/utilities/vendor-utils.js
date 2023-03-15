import 'dotenv/config';
import fetch from 'node-fetch';
import {
  URLSearchParams
} from 'url';
import {
  getCollectibleFromManifest,
  getItemFromManifest
} from './manifest-utils.js';

export async function getXurInventory() {
  const search = {
    method: 'GET',
    components: '402'
  };
  const url = new URL('https://www.bungie.net/Platform/Destiny2/Vendors/');
  url.search = new URLSearchParams(search).toString();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': `${process.env.DESTINY_API_KEY}`
    }
  });
  const xurManifest = await response.json();
  const inventoryNameList = await getItemFromManifest(
    3,
    Object.values(Object.values(xurManifest.Response.sales.data)[0].saleItems)
  );
  return inventoryNameList;
}

export async function getVendorModInventory(vendorId, person) {
  const oauthToken = await refreshOauthToken(person.name);
  const vendorUrl = new URL(`https://www.bungie.net/Platform/Destiny2/3/Profile/${person.profileId}/Character/${person.characterId}/Vendors/`);
  const searchParams = {
    components: 402
  };
  vendorUrl.search = new URLSearchParams(searchParams).toString();
  const response = await fetch(vendorUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${oauthToken}`,
      'x-api-key': `${process.env.CHASE_API_KEY}`
    }
  });
  const destinyVendorInventories = await response.json();
  let vendorInventory;

  for (let key in destinyVendorInventories.Response.sales.data) {
    if (key === vendorId) {
      vendorInventory = destinyVendorInventories.Response.sales.data[key].saleItems;
    }
  }

  return await getItemFromManifest(19, vendorInventory);
}

async function refreshOauthToken(name) {
  let oauthJson = '';
  let refreshToken = '';
  switch (name) {
    case 'Chase':
      refreshToken = `${process.env.CHASE_REFRESH_TOKEN}`;
      console.log('refresh token is '+ refreshToken)
      oauthJson = await getOauthJson(refreshToken);
      process.env.CHASE_REFRESH_TOKEN = oauthJson['refresh_token'];
      break;
    case 'John':
      refreshToken = `${process.env.JOHN_REFRESH_TOKEN}`;
      oauthJson = await getOauthJson(refreshToken);
      process.env.JOHN_REFRESH_TOKEN = oauthJson['refresh_token'];
      break;
    case 'Kyle':
      refreshToken = `${process.env.KYLE_REFRESH_TOKEN}`;
      oauthJson = await getOauthJson(refreshToken);
      process.env.KYLE_REFRESH_TOKEN = oauthJson['refresh_token'];
      break;
    case 'Casey':
      refreshToken = `${process.env.CASEY_REFRESH_TOKEN}`;
      oauthJson = await getOauthJson(refreshToken);
      process.env.CASEY_REFRESH_TOKEN = oauthJson['refresh_token'];
      break;
  }
  return oauthJson['access_token'];
}

async function getOauthJson(refreshToken) {
  const getOauthCredentials = await fetch(new URL('https://www.bungie.net/platform/app/oauth/token/'), {
    method: 'POST',
    headers: {
      'x-api-key': `${process.env.CHASE_API_KEY}`
    },
    body: new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken,
      'client_id': `${process.env.CLIENT_ID}`,
      'client_secret': `${process.env.CLIENT_SECRET}`
    })
  });
  const oauthJson = await getOauthCredentials.json();
  return oauthJson;
}

export async function getProfileCollectibles(person) {
  const oauthToken = await refreshOauthToken(person.name);
  const profileUrl = new URL(`https://www.bungie.net/Platform/Destiny2/3/Profile/${person.profileId}/`)
  profileUrl.search = new URLSearchParams({
    components: 800
  });
  console.log('oauthToken is '+oauthToken)
  const profileResponse = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'x-api-key': `${process.env.CHASE_API_KEY}`,
      Authorization: `Bearer ${oauthToken}`
    }
  });
  const profileJson = await profileResponse.json();
  const bansheeMods = await getVendorModInventory('672118013', person);
  const adaMods = await getVendorModInventory('350061650', person);
  const modsForSale = bansheeMods.concat(adaMods);
  const list1 = [];
  modsForSale.forEach(key => {
    if (profileJson.Response.profileCollectibles.data.collectibles[key].state == 65) {
      list1.push(key);
    }
  });

  return await getCollectibleFromManifest(19, list1);
}
