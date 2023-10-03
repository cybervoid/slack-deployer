const {loadBoltLocal, loadBoltLambda} = require("./slack/bolt_connector");

exports.handler = async (event, context, callback) => {

    try {
        if (event === undefined) {
            //initiate bolt in local mode
            const bolt = loadBoltLocal(event)
            await bolt.start(3000);
        } else {
            return await loadBoltLambda(event, context, callback)
        }

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
