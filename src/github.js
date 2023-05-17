const {getServiceInfo} = require("./deployer");
axios = require('axios');
axios.defaults.headers.common = {
    'Authorization': `bearer ${process.env.GitHubToken}`,
    "Content-Type": "application/json"
}

axios.defaults.baseURL = `https://api.github.com/repos/`;

module.exports.runDeployment = async (environment, branch, service) => {

    const serviceURI = getServiceInfo(service)
    axios.defaults.baseURL += `${serviceURI}/`;

    console.log(`Calling workflow at: `, axios.defaults.baseURL)

    const workflows = await listWorkFlows();

    let msg = `Fetching workflow list for selected repo ... \n`
    console.log(msg)
    if (workflows.workflows) {
        const workflowParam = serviceInfo["workflowName"]
        const regExp = RegExp(workflowParam)

        let workFlowFile = workflows.workflows.find(element => regExp.exec(element.name));
        if (workFlowFile) {
            res['message'] += `Matching workflow found as \`${workFlowFile.name}\` \n Requesting github to run workflow \`${workFlowFile.name}\` for branch \`${branch}\` \n`
            const runRes = await runWorkflow(`${workFlowFile.name}.yml`, branch, environment)
            res['message'] += runRes.message
            if (runRes.success) {
                res['success'] = true
            }
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

    // const serviceInfo = getServiceInfo(service)
    // const serviceURI = serviceInfo["url"]
    const serviceURI = getServiceInfo(service)

    console.log(`Getting branches at`, serviceURI)
    axios.defaults.baseURL += `${serviceURI}/`;

    try {
        const reqRes = await axios.get('branches').catch(err => {
            console.log(`Error calling get branches from github`, err)
            return {
                message: err
            }
        })

        if (reqRes.status === 200) {
            const branches = reqRes.data;

            console.log(`Branches`, branches)
            // if (branchRes) {
            //     res = {
            //         'success': true,
            //         'branch': branchRes['branch'],
            //         'server': branchRes['server'],
            //         'message': `Listing repo branches ... \n Found requested branch \`${branchRes['branch']}\` \n`
            //     }
            // } else {
            //     res['message'] = `${errorMsg} branch provided could not be found in the branch list \n`
            // }
        } else {
            res['message'] = `${errorMsg} ${reqRes.message} \n`
        }
    } catch (e) {
        res['message'] = `${errorMsg} ${e.message} \n`;
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