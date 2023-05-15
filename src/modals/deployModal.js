exports.renderDeploymentModal = () => {
    return {
        "type": "modal",
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
                "type": "input",
                "block_id": "branch",
                "element": {
                    "type": "plain_text_input",
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
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "QA",
                                "emoji": true
                            },
                            "value": "RolloutMPDQA"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Staging",
                                "emoji": true
                            },
                            "value": "RolloutMPDStaging"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Demo",
                                "emoji": true
                            },
                            "value": "RolloutMPDDemo"
                        }
                    ],
                    "action_id": "environment-action"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Deploy to:",
                    "emoji": true
                }
            }
        ]
    }
}