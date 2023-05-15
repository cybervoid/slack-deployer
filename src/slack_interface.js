const {deploymentModal} = require('./modal')
const {validateRequest, canDeploy} = require("./utils");

exports.attachSlackInterface = (app, event) => {

    const failedValidationMessage = `Sorry, you are not allowed to run this deployment`

    // Listens to incoming messages that contain "hello"
    app.message('hello', async ({message, say}) => {
        // say() sends a message to the channel where the event was triggered
        await say({
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Hey there <@${message.user}>!`
                    },
                    "accessory": {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Click Me"
                        },
                        "action_id": "button_click"
                    }
                }
            ],
            text: `Hey there <@${message.user}>!`
        });
    });

// Listen for a slash command invocation
    app.command('/deploy', async ({ack, body, client, logger, say}) => {
        // Acknowledge the command request
        await ack();

        if (validateRequest(event)) {
            try {
                // Call views.open with the built-in client
                const result = await client.views.open({
                    // Pass a valid trigger_id within 3 seconds of receiving it
                    trigger_id: body.trigger_id,
                    // View payload
                    view: deploymentModal()
                });
                // logger.info(result);
            } catch (error) {
                logger.error(error);
            }
        } else {
            await say(failedValidationMessage)
        }

    });

    app.view('view_deploy_callback', async ({ack, body, view, client, logger}) => {
        // Acknowledge the view_submission request
        await ack();

        const user = body['user']['username'];
        const userId = body['user']['id'];
        let msg = failedValidationMessage

        //add validate request here
        if (canDeploy(userId, user)) {
            const branch = view['state']['values']['branch']["branch-action"]["value"];
            const environment = view['state']['values']['deployment_environment']["environment-action"]["selected_option"]["value"];
            msg = `Deploying ${branch} to ${environment}`
        }

        try {
            await client.chat.postMessage({
                channel: userId,
                text: msg
            });
        } catch (error) {
            logger.error(error);
        }
    });
}