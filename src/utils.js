const querystring = require('querystring');

exports.validateRequest = (event) => {

    const decodedEventBody = Buffer.from(event.body, "base64").toString('utf-8')
    const payload = querystring.parse(decodedEventBody)
    const user = payload.user_name
    const userId = payload.user_id
    const allowedUsers = process.env.AllowedUsers
    console.log(`AllowedUsers:`, allowedUsers)
    console.log(`First user:`, allowedUsers[0])
    return false
}
