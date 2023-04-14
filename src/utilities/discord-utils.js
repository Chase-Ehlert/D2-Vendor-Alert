import 'dotenv/config'
import axios from 'axios'

export async function DiscordRequest(endpoint, options) {
  console.log(endpoint)
  console.log(options)
  const result = await axios.post('https://discord.com/api/v10/' + endpoint, {
      "content": `${options}`
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
