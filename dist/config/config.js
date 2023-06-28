import 'dotenv/config';
import * as joi from 'joi';
const environmentVariableSchema = joi
    .object()
    .keys({
    DATABASE_USER: joi.string().required(),
    DATABASE_CLUSTER: joi.string().required(),
    DATABASE_NAME: joi.string().required(),
    DATABASE_PASSWORD: joi.string().required(),
    API_KEY: joi.string().required(),
    TOKEN: joi.string().required(),
    CLIENT_ID: joi.string().required(),
    OAUTH_CLIENT_ID: joi.string().required(),
    OAUTH_SECRET: joi.string().required(),
})
    .unknown();
const { value, error } = environmentVariableSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
class Config {
    databaseUser;
    databaseCluster;
    databaseName;
    databasePassword;
    apiKey;
    token;
    clientId;
    oauthClientId;
    oauthSecret;
    constructor(databaseUser, databaseCluster, databaseName, databasePassword, apiKey, token, clientId, oauthClientId, oauthSecret) {
        this.databaseUser = databaseUser;
        this.databaseCluster = databaseCluster;
        this.databaseName = databaseName;
        this.databasePassword = databasePassword;
        this.apiKey = apiKey;
        this.token = token;
        this.clientId = clientId;
        this.oauthClientId = oauthClientId;
        this.oauthSecret = oauthSecret;
    }
}
export const config = new Config(value.DATABASE_USER, value.DATABASE_CLUSTER, value.DATABASE_NAME, value.DATABASE_PASSWORD, value.API_KEY, value.TOKEN, value.CLIENT_ID, value.OAUTH_CLIENT_ID, value.OAUTH_SECRET);
//# sourceMappingURL=config.js.map