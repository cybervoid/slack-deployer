const {App, AwsLambdaReceiver} = require('@slack/bolt');

const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: process.env.SIGNATURE,
});

const app = new App({
    token: process.env.TOKEN,
    receiver: awsLambdaReceiver,
});

app.command('/deploy', async ({command, ack, say}) => {
    // Acknowledge command request
    await ack();

    let reply = 'Command option not recognized, if you need help, you can use "/deploy help" \n';
    const help = 'Welcome to `deployer`! \n This tool allows to deploy from slack to github utilizing github actions \n ' +
        'To perform a deploy, please follow this structure \n' +
        '```/deploy branch_name environment``` \n' +
        'ie: ```/deploy feature/my-feat staging```';

    if (command.text === 'help' || command.text === '?') {
        reply = help;
    }

    await say(reply);
});


exports.handler = async (event, context) => {
    try {

        const handler = await awsLambdaReceiver.start();
        return handler(event, context);

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};