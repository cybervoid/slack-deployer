const {validateRequest, canDeploy, getServiceWorkflows, healthz} = require("../deployer");
const {renderDeploymentModal} = require('../modals/deployModal')
const {renderSelectServiceModal} = require('../modals/selectServiceModal')
const {runDeployment, getBranches} = require("../github")

exports.attachSlackInterface = (app, event) => {

    const failedValidationMessage = `Sorry, you are not allowed to run this deployment`
    console.log(`Request received`, event.isBase64Encoded === true ? Buffer.from(event.body, "base64").toString('utf-8') : event.body)

    // Listens to incoming messages that contain "hello"
    app.message('hello', async ({message, say}) => {
        await say(await healthz(message));
    });

    app.message('hi', async ({message, say}) => {
        await say(await healthz(message));
    });

    app.message('help', async ({message, say}) => {
        await say(await healthz(message));
    });

    /**
     * Process starts here for the deployment flow
     */
    app.command('/deploy', async ({ack, body, client, logger, say}) => {
        // Acknowledge the command request
        await ack();

        console.log(`Deployment requested, rendering deployment modal`)

        if (validateRequest(event)) {
            try {
                const result = await client.views.open({
                    trigger_id: body.trigger_id,
                    // View payload
                    view: renderSelectServiceModal(body.channel_id !== undefined ? body.channel_id : body.user_id)
                });
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

        console.log(`Deployment payload received`)

        const user = body['user']['username'];
        const userId = body['user']['id'];
        const branch = view['state']['values']["deployment_branches"]["branch-action"]["selected_option"]["value"];
        const environment = view['state']['values']['deployment_environment']["environment-action"]["selected_option"]["value"];
        const metadata = JSON.parse(view.private_metadata)

        let msg = `Error calling github action workflow for \`${environment}\` while trying to deploy \`${branch}\` to \`${metadata.service}\``

        try {
            if (canDeploy(userId, user)) {
                msg = await runDeployment(environment, branch, metadata.service).catch(err => console.log(msg, err))
                console.log(`Debug Data`, msg)
            } else {
                msg = failedValidationMessage
                console.log(`Alert!! user tried to deploy while not allowed. User: ${user} with ID: ${userId}`)
            }
        } catch (error) {
            logger.error(error);
        }

        await client.chat.postMessage({
            channel: metadata.channel,
            text: msg
        });
    });

    /**
     * Slack action to fetch the list of workflows for the selected application
     */
    app.action('service-to-deploy-action', async ({ack, body, client, logger}) => {
        await ack();

        const serviceToDeploy = body.actions[0].selected_option.value

        try {
            // Call views.update with the built-in client
            console.log(`Service selected by the user`, serviceToDeploy)

            const workflows = getServiceWorkflows(serviceToDeploy)
            const getBranchRes = await getBranches(serviceToDeploy)
            const metadata = {
                "channel": body.view.private_metadata,
                "service": serviceToDeploy
            }

            const result = await client.views.update({
                // Pass the view_id
                view_id: body.view.id,
                // Pass the current hash to avoid race conditions
                hash: body.view.hash,
                // View payload with updated blocks
                view: renderDeploymentModal(workflows, metadata, getBranchRes.branches)
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.command('/deployer_help', async ({ack, body, client, logger, say}) => {
        // Acknowledge the command request
        await ack();

        console.log(`Help command requested`, body)
        await say(await healthz({user: body["user_name"]}), {
            channel: body['user_id']
        })
    })
}
