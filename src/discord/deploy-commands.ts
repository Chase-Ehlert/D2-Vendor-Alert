// @ts-check

import { config } from '../../config/config.js'
import { REST, Routes } from 'discord.js'
import fs from 'fs'

const commands = []
const commandFiles = fs.readdirSync('./src/discord/commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = await import(`./commands/${file}`)
	commands.push(command.default.data)
}

const rest = new REST({ version: '10' }).setToken(String(config.token))

/**
 * Update registered slash commands
 */
async function registerCommands() {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)

		const data = await rest.put(
			Routes.applicationCommands(String(config.clientId)),
			{ body: commands }
		)

		console.log(`Successfully reloaded ${Object(data).length} application (/) commands.`)
	} catch (error) {
		console.error(error)
	}
}

await registerCommands()
