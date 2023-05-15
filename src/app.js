const {loadBoltLocal, loadBoltLambda} = require("./bolt_connector");

exports.handler = async (event, context) => {

    try {
        if (event === undefined) {
            //initiate bolt in local mode
            const bolt = loadBoltLocal(event)
            await bolt.start(3000);
        } else {
            return await loadBoltLambda(event, context)
        }

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
