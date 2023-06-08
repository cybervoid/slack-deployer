const {getServiceInfo} = require("../deployer");
let initialOptionBranch = {}

exports.renderDeploymentModal = (service, metadata, branches) => {

    const encryptedMetadata = JSON.stringify(metadata)

    return {
        "type": "modal",
        "private_metadata": encryptedMetadata,
        "title": {
            "type": "plain_text",
            "text": "Deployer",
            "emoji": true
        },
        "submit": {
            "type": "plain_text",
            "text": "Submit",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        callback_id: 'view_deploy_callback',
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Trying to deploy: *${metadata.service.toUpperCase()}* :bender_dance:`
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "input",
                "block_id": "deployment_branches",
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select Branch to deploy",
                        "emoji": true
                    },
                    "options": renderModalBranchList(branches),
                    "initial_option": initialOptionBranch,
                    "action_id": "branch-action"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Branch to deploy:",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "deployment_environment",
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select Environment",
                        "emoji": true
                    },
                    "options": getServiceWorkflows(service),
                    "action_id": "environment-action"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Environment to deploy to:",
                    "emoji": true
                }
            }
        ]
    }
}

function renderModalBranchList(branchList) {
    const res = []
    branchList.forEach(currentElement => {
        const element = {
            "text": {
                "type": "plain_text",
                "text": currentElement.name,
                "emoji": true
            },
            "value": currentElement.name
        }
        if (currentElement.name === "develop") {
            initialOptionBranch = element
        }
        res.push(element)
    })

    return res
}

/**
 * Organizes the dropdown to be shown with the list of apps/services
 *
 * @param service
 * @returns {*}
 */
function getServiceWorkflows(service) {

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
        })
    })

    return res
}


