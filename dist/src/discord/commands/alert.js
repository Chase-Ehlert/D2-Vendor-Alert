import { config } from '../../../config/config.js';
import { hyperlink, SlashCommandBuilder } from 'discord.js';
export default {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
    async execute(interaction) {
        interaction.followUp(hyperlink('Authorize D2 Vendor Alert', `https://www.bungie.net/en/oauth/authorize?client_id=${config.oauthClientId}&response_type=code`));
    }
};
//# sourceMappingURL=alert.js.map