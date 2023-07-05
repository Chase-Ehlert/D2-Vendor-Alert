import * as fs from 'fs'
import { REST, Routes } from 'discord.js'
import { Config } from '../../config/config.js'

const config = new Config()
const commands: any[] = []
const commandFiles = fs.readdirSync('./src/discord/commands').filter(file => file.endsWith('.ts'))

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`)
  commands.push(command.default.data)
}

const rest = new REST({ version: '10' }).setToken(String(config.configModel.token))

/**
 * Update registered slash commands
 */
async function registerCommands (): Promise<void> {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    const data = await rest.put(
      Routes.applicationCommands(String(config.configModel.clientId)),
      { body: commands }
    )

    console.log(`Successfully reloaded ${String(Object(data).length)} application (/) commands.`)
  } catch (error) {
    console.error(error)
  }
}

await registerCommands()
