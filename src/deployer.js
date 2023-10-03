const {SecretsManagerClient, GetSecretValueCommand} = require("@aws-sdk/client-secrets-manager");


const querystring = require('querystring');
const {healthzModal} = require("./modals/healthzModal");
const fullServiceInfo = JSON.parse(process.env.SupportedApps)

function canDeploy(userId, user) {
    const allowedUsers = JSON.parse(process.env.AllowedUsers)

    return (userId === allowedUsers[user])

}

exports.validateRequest = event => {
    const decodedEventBody = Buffer.from(event.body, "base64").toString('utf-8')

    return querystring.parse(decodedEventBody)
}


/**
 * Gets service information from the JSON provided in the env variables
 *
 * If the service parameter is provided, the corresponding key will be returned with the URI
 *
 * @param service
 * @returns {*}
 */
function getServiceInfo(service = false) {
    return service !== false ? fullServiceInfo[service]["url"] : fullServiceInfo
}

exports.getSecret = async secretName => {

    const client = new SecretsManagerClient();
    const input = {"SecretId": secretName}
    const command = new GetSecretValueCommand(input);

    const secret = await client.send(command);
    return secret.SecretString
}

exports.healthz = async message => {
    const serviceInfo = JSON.parse(process.env.SupportedApps)
    const approvedUsers = JSON.parse(process.env.AllowedUsers)

    return healthzModal(message, serviceInfo, approvedUsers)
}

exports.renderUnAuthorizedMessage = (user, message = null) => {

    const userMsg = message || `*I'm sorry <@${user}>! I'm afraid I can't do that.*`
    return {
        "blocks": [
            {
                "type": "image",
                "image_url": "https://static.wikia.nocookie.net/villains/images/1/1c/HAL9000_Case.svg.png/revision/latest?cb=20200411073029",
                "alt_text": "inspiration"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": userMsg
                }
            }
        ],
        "text": userMsg
    }
}

/**
 * Returns the url section from the settings JSON, should match the owner/repo_name section
 * of a GitHub URL
 *
 * @param service
 * @returns {*}
 */
exports.getRepoURI = service => {
    return getServiceInfo(service)
}

exports.canDeploy = canDeploy
exports.getServiceInfo = getServiceInfo

