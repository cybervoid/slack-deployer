exports.healthzModal = (message, services, users) => {

    let healthReport = {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "App Health",
                    "emoji": true
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Hey there <@${message.user}>! \n`
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":bender_dance: Looking for provided settings ..."
                }
            },
        ],
        text: `You should not see this text`
    }

    const serviceReport = parseServiceList(services)
    const usersReport = getUserReport(users)

    healthReport["blocks"] = [...healthReport["blocks"], ...serviceReport, ...usersReport]
    return healthReport
}

function parseServiceList(serviceInfo) {
    const serviceReport = []
    const services = Object.keys(serviceInfo)

    services.forEach(service => {

        serviceReport.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Found service *${service.toUpperCase()}*: 
 - \`url\`: ${serviceInfo[service]["url"]} 
 - \`workflow\`: <https://github.com/${serviceInfo[service]["url"]}/blob/develop/.github/workflows/${serviceInfo[service]["workflowName"]}.yml|${serviceInfo[service]["workflowName"]}> 
 - \`workflows inputs\`:  
 ${getWorkflows(serviceInfo[service]["workflows"])}`
            }
        })
    })

    return serviceReport
}

function getWorkflows(serviceInfo) {
    let res = ``
    serviceInfo.forEach(workflow => {
        res += ` \t - *${workflow["name"]} * : ${workflow["value"]} \n`
    })
    return res
}

function getUserReport(users) {
    const userNames = Object.keys(users)

    let res = `Users found ${userNames.length} \n`
    userNames.forEach(user => {
        res += ` - *${user}* \n`
    })

    return [
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":bender_dance: Looking for authorized users ..."
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": res
            }
        }
    ]
}