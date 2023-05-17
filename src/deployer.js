const querystring = require('querystring');

function canDeploy(userId, user) {
    const allowedUsers = JSON.parse(process.env.AllowedUsers)

    return (userId === allowedUsers[user])

}

exports.validateRequest = (event) => {

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

    const supportedApps = JSON.parse(process.env.SupportedApps)
    const serviceInfo = supportedApps[service][["workflows"]]

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

exports.canDeploy = canDeploy

