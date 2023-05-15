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

exports.canDeploy = canDeploy

