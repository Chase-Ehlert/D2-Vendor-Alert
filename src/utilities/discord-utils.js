import 'dotenv/config'
import axios from 'axios'

export async function DiscordRequest(endpoint, message) {
  const result = await axios.post('https://discord.com/api/v10/' + endpoint, {
      "content": message
},{
    headers: {
      Authorization: `Bot ${process.env.VENDOR_ALERT_TOKEN}`,
      'Content-Type': 'application/json',
    }, 
  })

  if (!result.ok) {
    const data = await result.json()
    console.log(result.status)
    throw new Error(JSON.stringify(data))
  }
  
  return result
}
