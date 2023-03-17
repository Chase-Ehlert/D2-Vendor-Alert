import { REST, Routes } from 'discord.js'
import 'dotenv/config'
import fs from 'fs'

const commands = []
const commandFiles = fs.readdirSync('./src/discord/commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = await import(`./commands/${file}`)
	commands.push(command.default.data)
}

const rest = new REST({ version: '10' }).setToken(process.env.VENDOR_ALERT_TOKEN)

async function registerCommands() {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)

		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.VENDOR_ALERT_CLIENT_ID, process.env.VENDOR_ALERT_GUILD_ID),
			{ body: commands }
		)

		console.log(`Successfully reloaded ${data.length} application (/) commands.`)
	} catch (error) {
		console.error(error)
	}
}

await registerCommands()