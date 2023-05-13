const {deploymentModal} = require('./modal')

exports.attachSlackInterface = app => {

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
    app.command('/deploy', async ({ack, body, client, logger}) => {
        // Acknowledge the command request
        await ack();

        try {
            // Call views.open with the built-in client
            const result = await client.views.open({
                // Pass a valid trigger_id within 3 seconds of receiving it
                trigger_id: body.trigger_id,
                // View payload
                view: deploymentModal()
            });
            logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    });

    app.command('/nombre', async ({ack, body, client, logger}) => {
        // Acknowledge the command request
        await ack();

        try {
            // Call views.open with the built-in client
            const result = await client.views.open({
                // Pass a valid trigger_id within 3 seconds of receiving it
                trigger_id: body.trigger_id,
                // View payload
                view: deploymentModal()
            });
            logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    });
}