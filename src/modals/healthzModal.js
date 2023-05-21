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

    console.log(`Debug info: `, JSON.stringify(healthReport["blocks"], null, 4))
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
 - \`workflowName\`: ${serviceInfo[service]["workflowName"]} 
 - \`workflows\`:  
 ${getWorkflows(serviceInfo[service]["workflows"])}
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Checking for repo and workflow access... \n Github responded with a *204* :thumbsup: \n Can't connect to Github :thumbsdown: Please check the logs"
                }
            }
        )
    })

    return serviceReport
}

function getWorkflows(serviceInfo) {

    console.log(`DEBUG serviceInfo`, serviceInfo)
    let res = ``
    serviceInfo.forEach(workflow => {
        console.log(`DEBUG workflow`, workflow)
        res += ` \t - *${workflow["name"]} *
    : ${workflow["value"]}
    \n`
    })
    return res
}