const {App} = require('@slack/bolt');


exports.loadBolt = (local) => {

    let app;
    if (local === true) {
        app = new App({
            token: process.env.SLACK_BOT_TOKEN,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
        });
    } else {
        //loading from a lambda function
        const awsLambdaReceiver = new AwsLambdaReceiver({
            signingSecret: process.env.SLACK_SIGNING_SECRET,
        });

        app = new App({
            token: process.env.SLACK_BOT_TOKEN,
            receiver: awsLambdaReceiver,
        });
    }

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
                view: {
                    type: 'modal',
                    // View identifier
                    callback_id: 'view_1',
                    title: {
                        type: 'plain_text',
                        text: 'Modal title'
                    },
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: 'Welcome to a modal with _blocks_'
                            },
                            accessory: {
                                type: 'button',
                                text: {
                                    type: 'plain_text',
                                    text: 'Click me!'
                                },
                                action_id: 'button_abc'
                            }
                        },
                        {
                            type: 'input',
                            block_id: 'input_c',
                            label: {
                                type: 'plain_text',
                                text: 'What are your hopes and dreams?'
                            },
                            element: {
                                type: 'plain_text_input',
                                action_id: 'dreamy_input',
                                multiline: true
                            }
                        }
                    ],
                    submit: {
                        type: 'plain_text',
                        text: 'Submit'
                    }
                }
            });
            logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    });


    return app;
}



