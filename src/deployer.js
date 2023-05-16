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

exports.getServiceDeployments = service => {

    const supportedApps = JSON.parse(process.env.SupportedApps)
    const dropdown = supportedApps[service]
    let res = []
    dropdown.forEach(currentElement => {
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

exports.deploy = async projectName => {

    try {
//

    } catch (err) {
        console.log(`Error calling codeBuild`, err)
    }

}

exports.canDeploy = canDeploy

