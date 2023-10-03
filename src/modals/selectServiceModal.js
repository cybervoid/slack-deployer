exports.renderSelectServiceModal = respondTo => {
    return {
        "type": "modal",
        "private_metadata": respondTo,
        "title": {
            "type": "plain_text",
            "text": "Deployer",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        "blocks": [
            {
                "type": "actions",
                "elements": [{
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select service to deploy",
                        "emoji": true
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "PMB",
                                "emoji": true
                            },
                            "value": "pmb"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "MPD",
                                "emoji": true
                            },
                            "value": "mpd"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "BC",
                                "emoji": true
                            },
                            "value": "bc"
                        }
                    ],
                    "action_id": "service-to-deploy-action",
                }],
            },
        ]
    }
}