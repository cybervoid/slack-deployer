const {deploymentModal} = require('./modals/modal')
const {validateRequest, canDeploy} = require("./utils");

exports.attachSlackInterface = (app, event) => {

    const failedValidationMessage = `Sorry, you are not allowed to run this deployment`
    console.log(`Request received`, event.body.isBase64Encoded === true ? Buffer.from(event.body, "base64").toString('utf-8') : event.body)

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

    app.action('service-to-deploy-action', async ({ack, body, client, logger}) => {
        // Acknowledge the button request
        await ack();

        console.log(`service selected`, body)
        try {
            // Call views.update with the built-in client
            const result = await client.views.update({
                // Pass the view_id
                view_id: body.view.id,
                // Pass the current hash to avoid race conditions
                hash: body.view.hash,
                // View payload with updated blocks
                view: {
                    type: 'modal',
                    // View identifier
                    callback_id: 'view_1',
                    title: {
                        type: 'plain_text',
                        text: 'Updated modal'
                    },
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'plain_text',
                                text: 'You updated the modal!'
                            }
                        },
                        {
                            type: 'image',
                            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
                            alt_text: 'Yay! The modal was updated'
                        }
                    ]
                }
            });
            logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    });
}