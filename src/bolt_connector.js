const {App} = require('@slack/bolt');
const {attachSlackInterface} = require('./slack_interface')


exports.loadBoltLocal = () => {

    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
    });
    attachSlackInterface(app)

    return app;
}


exports.loadBoltLambda = () => {
    const awsLambdaReceiver = new AwsLambdaReceiver({
        signingSecret: process.env.SLACK_SIGNING_SECRET,
    });

    app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        receiver: awsLambdaReceiver,
    });

}



