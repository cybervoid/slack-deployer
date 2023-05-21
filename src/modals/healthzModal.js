exports.healthzModal = (message, services, users) => {

    const healthReport = {
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

    healthReport["blocks"] = Object.assign(healthReport["blocks"], serviceReport)
    return healthReport
}

async function parseServiceList(serviceInfo) {
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
            }
        )
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