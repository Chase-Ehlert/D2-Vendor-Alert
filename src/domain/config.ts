import { DestinyConfig } from '../infrastructure/destiny/config/destiny-config.js';
import { DatabaseConfig } from '../infrastructure/persistence/configs/database-config.js';
import { DiscordConfig } from '../presentation/discord/configs/discord-config.js';

export interface Config extends DatabaseConfig, DiscordConfig, DestinyConfig{}
