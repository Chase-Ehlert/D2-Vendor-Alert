import 'dotenv/config'
import axios from 'axios'

export async function DiscordRequest(endpoint, options) {
  if (options.body) options.body = JSON.stringify(options.body)
  const result = await axios.post('https://discord.com/api/v10/' + endpoint, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    }, ...options
  })

  if (!result.ok) {
    const data = await result.json()
    console.log(result.status)
    throw new Error(JSON.stringify(data))
  }
  
  return result
}
