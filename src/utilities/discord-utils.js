import 'dotenv/config'
import axios from 'axios'

export async function DiscordRequest(endpoint, message) {
  const result = await axios.post('https://discord.com/api/v10/' + endpoint,
    {
      "content": message
    },
    {
      headers: {
        Authorization: `Bot ${process.env.VENDOR_ALERT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (result.status != 200) {
    throw new Error(result.status)
  }

  return result
}
