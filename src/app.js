import 'dotenv/config'
import express from 'express'
import * as database from './database/users-operations.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { handleRefreshToken } from './database/refresh-token.js'
import path from 'path'
import { getXurInventory, getProfileCollectibles} from './utilities/vendor-utils.js';
import { getAggregatedManifestFile } from './utilities/manifest-utils.js';
import { DiscordRequest } from './utilities/discord-utils.js';

const app = express()
const directoryName = path.dirname('app.js')

database.setupDatabaseConnection()
setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', async (request, result) => {
  handleRefreshToken(request)

  result.sendFile('views/landing-page.html', { root: directoryName })
})






// const discordEndpoint = `channels/${process.env.CHANNEL_ID}/messages`;

// async function sendMessage() {
//   let time = new Date();
//   const timeOfDay = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
//   const people = createGroup();

//   for (const person of people) {
//     console.log(person.name + ' is starting');
//     const unownedModList = await getProfileCollectibles(person);
//     if (unownedModList.length > 0) {
//       await shareUnownedModsList(person, unownedModList);
//     } else {
//       await shareEmptyModsList(person.name);
//     }
//     console.log(person.name + ' has finished');
//   }

//   if (timeOfDay === '13:2:1') {
//     for (const person of people) {
//       console.log(person.name + ' is starting');
//       const unownedModList = await getProfileCollectibles(person);
//       if (unownedModList.length > 0) {
//         await shareUnownedModsList(person, unownedModList);
//       } else {
//         await shareEmptyModsList(person.name);
//       }
//       console.log(person.name + ' has finished');
//     }
//   }
// }

// // while (true) {
// //   await sendMessage();
// // }

// await sendMessage();

// async function shareUnownedModsList(person, unownedModList) {
//   let message = `<@${person.discordId}>\r\nYou have these unowned mods for sale, grab them!`;

//   unownedModList.forEach(mod => {
//     message = message + `\r\n${mod}`;
//   });

//   await DiscordRequest(discordEndpoint, {
//     method: 'POST',
//     body: {
//       content: message,
//     }
//   });
// }

// async function shareEmptyModsList(name) {
//   let message = `${name} does not have any unowned mods for sale today.`;

//   await DiscordRequest(discordEndpoint, {
//     method: 'POST',
//     body: {
//       content: message,
//     }
//   });
// }

// function createGroup() {
//   const chase = {
//     name: 'Chase',
//     profileId: '4611686018467377402',
//     characterId: '2305843009752986497',
//     discordId: '144989484994396160'
//   };
//   const john = {
//     name: 'John',
//     profileId: '4611686018468594461',
//     characterId: '2305843009865754214',
//     discordId: '150407958155624448'
//   };
//   const kyle = {
//     name: 'Kyle',
//     profileId: '4611686018509699433',
//     characterId: '2305843010051954330',
//     discordId: '267429975072833537'
//   };
//   const casey = {
//     name: 'Casey',
//     profileId: '4611686018467439606',
//     characterId: '2305843009395202985',
//     discordId: '192797584497180672'
//   };

//   // return [chase, john, kyle, casey];
//   return [john, kyle, casey];
// }

// async function xur() {
//   let xurInventoryMessage = "Xur is selling:\r\n";
//   let xurItems = await getXurInventory();
//   xurItems.forEach(item => {
//     xurInventoryMessage = xurInventoryMessage + item + "\r\n";
//   });
//   return xurInventoryMessage;
// }

// async function aggregateFile() {
//   return await getAggregatedManifestFile();
// }
