const {validateRequest, canDeploy, getServiceDeployments, deploy} = require("./deployer");
const {renderDeploymentModal} = require('./modals/deployModal')
const {renderSelectServiceModal} = require('./modals/selectServiceModal')
const {runDeployment} = require("./github")

exports.attachSlackInterface = (app, event) => {

    const failedValidationMessage = `Sorry, you are not allowed to run this deployment`
    console.log(`Request received`, event.isBase64Encoded === true ? Buffer.from(event.body, "base64").toString('utf-8') : event.body)

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
            text: `Hey there <@${message.user}>`
        });
    });

    /**
     * Process starts here for the deployment flow
     */
    app.command('/deploy', async ({ack, body, client, logger, say}) => {
        // Acknowledge the command request
        await ack();

        if (validateRequest(event)) {
            try {
                const result = await client.views.open({
                    trigger_id: body.trigger_id,
                    // View payload
                    view: renderSelectServiceModal()
                });
                // logger.info(result);
            } catch (error) {
                logger.error(error);
            }
        } else {
            await say(failedValidationMessage)
        }

    });

    /**
     * Actual deployment, invoked by the last Modal (on submit)
     */
    app.view('view_deploy_callback', async ({ack, body, view, client, logger}) => {
        // Acknowledge the view_submission request
        await ack();
        const user = body['user']['username'];
        const userId = body['user']['id'];
        let msg = failedValidationMessage
        console.log(`Request to deploy received`)

        try {
            //add validate request here
            if (canDeploy(userId, user)) {
                const branch = view['state']['values']['branch']["branch-action"]["value"];
                const environment = view['state']['values']['deployment_environment']["environment-action"]["selected_option"]["value"];
                console.log(`Raw`, view['state']['values'])
                console.log(`Branch`, branch)
                console.log(`Environment`, environment)

                msg = `Deploying ${branch} to ${environment}`
                console.log(msg)
                const kk = await runDeployment(environment, branch)
                console.log(`Debug Data`, kk)
            }

            await client.chat.postMessage({
                channel: userId,
                text: msg
            });
        } catch (error) {
            logger.error(error);
        }
    });

    /**
     * slack action to fetch the list of workflows for the selected application
     */
    app.action('service-to-deploy-action', async ({ack, body, client, logger}) => {
        await ack();

        const serviceToDeploy = body.actions[0].selected_option.value

        try {
            // Call views.update with the built-in client
            const result = await client.views.update({
                // Pass the view_id
                view_id: body.view.id,
                // Pass the current hash to avoid race conditions
                hash: body.view.hash,
                // View payload with updated blocks
                view: renderDeploymentModal(getServiceDeployments(serviceToDeploy))
            });
        } catch (error) {
            logger.error(error);
        }
    });
}