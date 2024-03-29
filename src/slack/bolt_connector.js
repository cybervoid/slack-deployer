const {App, AwsLambdaReceiver} = require('@slack/bolt');
const {attachSlackInterface} = require('./slack_interface')
const {getSecret} = require("../deployer");


exports.loadBoltLocal = (event) => {

    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
    });
    attachSlackInterface(app, event)

    return app;
}

/**
 *  Initiates Slack's Framework
 *
 * @param event
 * @param context
 * @param callback
 * @returns {Promise<AwsResponse>}
 */
exports.loadBoltLambda = async (event, context, callback) => {
    const awsLambdaReceiver = new AwsLambdaReceiver({
        signingSecret: await getSecret(process.env.SLACK_SIGNING_SECRET),
    });

    const app = new App({
        token: await getSecret(process.env.SLACK_BOT_TOKEN),
        receiver: awsLambdaReceiver,
    });

    // attach all the recognized commands with their logic
    attachSlackInterface(app, event)

    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);

}



