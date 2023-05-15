const {App, AwsLambdaReceiver} = require('@slack/bolt');
const {attachSlackInterface} = require('./slack_interface')


exports.loadBoltLocal = (event) => {

    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
    });
    attachSlackInterface(app, event)

    return app;
}


exports.loadBoltLambda = async (event, context, callback) => {
    const awsLambdaReceiver = new AwsLambdaReceiver({
        signingSecret: process.env.SLACK_SIGNING_SECRET,
    });

    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        receiver: awsLambdaReceiver,
    });

    attachSlackInterface(app, event)

    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);

}



