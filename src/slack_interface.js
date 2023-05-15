const {deploymentModal} = require('./modal')
const {validateRequest} = require("./utils");

exports.attachSlackInterface = (app, event) => {

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
            await say(`Sorry, you are not allowed to run this deployment`)
        }

    });

    app.view('view_deploy_callback', async ({ack, body, view, client, logger}) => {
        // Acknowledge the view_submission request
        await ack();

        //add validate request here

        console.log(`Body`, body)
        console.log(`View`, view)
        // Assume there's an input block with `block_1` as the block_id and `input_a`
        const branch = view['state']['values']['branch']["branch-action"]["value"];
        const environment = view['state']['values']['deployment_environment']["environment-action"]["selected_option"]["value"];
        const user = body['user']['username'];
        const userId = body['user']['id'];
        console.log(`Branch`, branch)
        console.log(`User:`, view['state']['values']['deployment_environment']["environment-action"])
        console.log(`environment:`, environment)

        // Message to send user
        let msg = 'ok Done!';

        // Message the user
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