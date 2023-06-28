import * as path from 'path';
import * as fileSystem from 'fs';
import * as discord from 'discord.js';
import * as url from 'url';
import { DatabaseRepository } from '../database/database-repository.js';
import { config } from '../../config/config.js';
import { DestinyService } from '../services/destiny-service.js';
const databaseRepo = new DatabaseRepository();
const destinyService = new DestinyService();
export class DiscordClient {
    /**
       * Connect to the Discord Client
       */
    async setupDiscordClient() {
        const discordClient = new discord.Client({
            intents: [
                discord.GatewayIntentBits.Guilds,
                discord.GatewayIntentBits.GuildMessages,
                discord.GatewayIntentBits.MessageContent,
                discord.GatewayIntentBits.GuildMessageReactions
            ]
        });
        discordClient.commands = new discord.Collection();
        discordClient.once(discord.Events.ClientReady, (eventClient) => {
            console.log(`Ready, logged in as ${String(eventClient.user.tag)}`);
        });
        discordClient.login(config.token);
        await this.setupSlashCommands(discordClient);
        await this.replyToSlashCommands(discordClient);
    }
    /**
       * Initialiaze registered slash commands
       */
    async setupSlashCommands(discordClient) {
        const commandsPath = path.join(url.fileURLToPath(new URL('./', import.meta.url)), 'commands');
        const commandsFiles = fileSystem.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandsFiles) {
            const filePath = path.join(commandsPath, file);
            const command = await import(`./commands/${file}`);
            if ('data' in command.default && 'execute' in command.default) {
                discordClient.commands.set(command.default.data.name, command.default);
            }
            else {
                console.log(`The command at ${filePath} is missing "data" or "execute"`);
            }
        }
    }
    /**
       * Respond to any slash command and prompt user for profile information
       */
    async replyToSlashCommands(discordClient) {
        discordClient.on(discord.Events.InteractionCreate, async (interaction) => {
            if (!interaction.isCommand())
                return;
            const command = interaction.client.commands.get(interaction.commandName);
            try {
                await interaction.reply('What is your Bungie Net username? (i.e. "Guardian#1234")');
                const filter = (message) => message.author.id === interaction.user.id;
                if (interaction.channel !== null) {
                    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 20000 });
                    collector.on('collect', async (message) => {
                        await this.handleIncommingMessage(message, interaction, command);
                    });
                    collector.on('end', async (collected) => {
                        if (collected.size === 0) {
                            await interaction.followUp({
                                content: 'The interaction has timed out. After you have found your Bungie Net username, try again.'
                            });
                        }
                    });
                }
            }
            catch (error) {
                console.log(error);
                await interaction.reply({ content: 'Something went wrong!' });
            }
        });
    }
    /**
       * Validate user's submitted profile information
       */
    async handleIncommingMessage(message, interaction, command) {
        if (await this.doesBungieUsernameExistInDestiny(message)) {
            await databaseRepo.doesUserExist(message.content)
                ? await this.replyUserExists(interaction)
                : await this.addUserToAlertBot(command, message.content, interaction);
        }
        else {
            interaction.followUp({ content: 'That is not a valid Bungie Net username!' });
        }
    }
    /**
       * Reply back to user that they're profile information exists in the database already
       */
    async replyUserExists(interaction) {
        await interaction.followUp({ content: 'User already exists!' });
    }
    /**
       * Add user's profile information to database
       */
    async addUserToAlertBot(command, username, interaction) {
        await databaseRepo.addUser(username, interaction.user.id, interaction.channelId);
        command.execute(interaction);
    }
    /**
       * Validate the user's submitted username exists in Destiny 2
       */
    async doesBungieUsernameExistInDestiny(message) {
        const index = message.content.indexOf('#');
        const bungieUsername = message.content.substring(0, index);
        const bungieUsernameCode = message.content.substring(Number(index) + 1, message.content.length);
        const response = await destinyService.getDestinyUsername(bungieUsername, bungieUsernameCode);
        return Object(response).length !== 0;
    }
}
//# sourceMappingURL=discord-client.js.map