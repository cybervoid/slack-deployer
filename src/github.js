const {getServiceInfo} = require("./deployer");
axios = require('axios');
axios.defaults.headers.common = {
    'Authorization': `bearer ${process.env.GitHubToken}`,
    "Content-Type": "application/json"
}

axios.defaults.baseURL = `https://api.github.com/repos/`;

module.exports.runDeployment = async (environment, branch, service) => {

    const workflows = await listWorkFlows();

    let msg = `Deployment request received \n Fetching workflow list for selected repo ... \n`
    console.log(msg)
    if (workflows.workflows) {
        const workflowParam = getServiceInfo()[service]["workflowName"]
        console.log(`Delete me`, workflowParam)
        const regExp = RegExp(workflowParam)

        let workFlowFile = workflows.workflows.find(element => regExp.exec(element.name));
        if (workFlowFile) {
            msg += `Deployment workflow found: \`${workFlowFile.name}\` \n Requesting github to run it for branch \`${branch}\` \n`
            console.log(msg)
            msg += await runWorkflow(`${workFlowFile.name}.yml`, branch, environment)
            console.log(msg)
        } else {
            msg += `Could not find a workflow matching \`${workflowParam}\``
        }
    } else {
        msg += `Could not get workflow list for this repo. More info: ${workflows} \n`
    }

    return msg;
}

/**
 * Get a list of branches from GitHub
 */
exports.getBranches = async service => {

    const errorMsg = `Error fetching branch list. More Info:`
    const res = {
        message: errorMsg,
        branches: {}
    }

    const serviceURI = getServiceInfo(service)

    console.log(`Getting branches at`, serviceURI)
    axios.defaults.baseURL += `${serviceURI}/`;

    try {
        const reqRes = await axios.get('branches').catch(err => {
            console.log(errorMsg, err)
        })

        if (reqRes.status === 200) {
            res.branches = reqRes.data;
        } else {
            console.log(errorMsg, reqRes)
        }
    } catch (e) {
        console.log(errorMsg, e)
    }

    return res
}

function matchBranchName(context, branchList) {
    let res = false;

    for (let i = 1; i <= 2; i++) {
        const branch = branchList.find(el => el.name === context[i])

        if (branch) {
            res = {
                'branch': branch.name,
                'server': context[i === 1 ? 2 : 1]
            }
            break
        }
    }

    return res
}

async function runWorkflow(name, branch, environment) {
    const url = `actions/workflows/${name}/dispatches`;
    const res = {
        'success': false,
        'message': `Error trying to initiate workflow ${name}`
    };

    try {
        const workflowInput = {
            "branch_name": branch,
            "environment": environment
        }

        console.log(`Calling github workflow ${name} with input:`, workflowInput)

        const creationRes = await axios.post(url, {
            "ref": "refs/heads/develop",
            "inputs": workflowInput
        });
        if (creationRes.status === 204) {
            res['success'] = true;
            res['message'] = 'Success from Github, deployment workflow triggered successfully'
        } else {
            res['message'] += `, return request status ${creationRes.status}, data: ${creationRes.data}`
        }
    } catch (e) {
        res['message'] += `, error response: ${e.message}`;
    }

    return res
}

async function listWorkFlows() {
    return axios.get(`actions/workflows`)
        .then((res) => {
            return res.data;
        })
        .catch(err => {
            return err
        })

}