axios = require('axios');
axios.defaults.headers.common = {'Authorization': `bearer ${process.env.GA_TOKEN}`, "Content-Type": "application/json"}
axios.defaults.baseURL = 'https://api.github.com'

module.exports.runDeployment = async (context) => {

    const workflows = await listWorkFlows();
    const res = {
        'success': false
    };

    if (workflows.workflows) {
        const param1 = context[1];
        const regExp = RegExp(param1);

        let found = workflows.workflows.find(element => regExp.exec(element.name));
        if (found) {
            console.log(`found status: ${found.name}`)
        } else {
            //try the second parameter in case the order is reversed
            const param2 = context[2];
            const regExp = RegExp(param2);

            found = workflows.workflows.find(element => regExp.exec(element.name));
        }

        if (found) {
            //if workflow found, get the filename
            const res = runWorkflow(found.name + '.yml');
        }
        console.log(`found ${found.name}`);
    } else {
        res['message'] = `Could not find workflows listed for this repo. More info: ${workflows}`
    }

    return res;
}

async function runWorkflow(name) {
    const url = `repos/${process.env.GA_ORGANIZATION}/${process.env.GA_PROJECT}/actions/workflows/${name}/dispatches`;
    const err = `Error trying to initiate workflow ${name}`;
    const res = {
        'success': false
    };

    try {
        const creationRes = await axios.post(url, {
            "ref": "refs/heads/develop",
            "inputs": {
                "branch_name": "develop"
            }
        });
        if (creationRes.status === 204) {
            res['success'] = true;
            res['message'] = 'Deployment workflow triggered successfully'
        } else {
            res['message'] = `${err}, return request status ${creationRes.status}, data: ${creationRes.data}`
        }
    } catch (e) {
        res['message'] = `${err}, error response: ${e.message}`;
        console.log(res['message']);
    }

    console.log(res);
}

async function listWorkFlows() {
    return axios.get(`repos/${process.env.GA_ORGANIZATION}/${process.env.GA_PROJECT}/actions/workflows`)
        .then((res) => {
            return res.data;
        })
        .catch(err => {
            return err
        })

}