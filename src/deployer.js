const querystring = require('querystring');
const fullServiceInfo = JSON.parse(process.env.SupportedApps)

function canDeploy(userId, user) {
    const allowedUsers = JSON.parse(process.env.AllowedUsers)

    return (userId === allowedUsers[user])

}

exports.validateRequest = event => {

    const decodedEventBody = Buffer.from(event.body, "base64").toString('utf-8')
    const payload = querystring.parse(decodedEventBody)

    return canDeploy(payload.user_id, payload.user_name)
}

/**
 * Organizes the dropdown to be shown with the list of apps/services
 *
 * @param service
 * @returns {*}
 */
exports.getServiceWorkflows = service => {

    const serviceInfo = getServiceInfo()[service][["workflows"]]
    console.log(`Getting workflow from SupportedApps JSON`, service)

    const res = []
    serviceInfo.forEach(currentElement => {
        res.push({
                "text": {
                    "type": "plain_text",
                    "text": currentElement.name,
                    "emoji": true
                },
                "value": currentElement.value
            },
        )
    })

    return res
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

exports.canDeploy = canDeploy
exports.getServiceInfo = getServiceInfo

