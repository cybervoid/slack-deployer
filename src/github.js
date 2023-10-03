const {getSecret, getServiceInfo, getRepoURI} = require("./deployer")
axios = require('axios');

module.exports.runDeployment = async (environment, branch, service) => {

    const workflows = await listWorkFlows();

    let msg = `Deployment request received \nFetching workflow list for *${service.toUpperCase()}* ... \n`
    console.log(msg)
    if (workflows.workflows) {
        const workflowParam = getServiceInfo()[service]["workflowName"]
        const regExp = RegExp(workflowParam, "i")

        let workFlowFile = workflows.workflows.find(element => regExp.exec(element.path));
        if (workFlowFile) {
            msg += `Deployment workflow found: \`${workFlowFile.name}\` \nRequesting github to run it for branch \`${branch}\` \n`
            console.log(msg)
            msg += await runWorkflow(workFlowFile.id, branch, environment, service)
            console.log(msg)
        } else {
            msg += `Could not find a workflow matching \`${workflowParam}\``
        }
    } else {
        msg += `Could not get workflow list for this repo. More info: ${workflows} \n`
    }

    return msg;
}

async function initAxios(url) {
    const githubToken = await getSecret(process.env.GitHubToken)
    axios.defaults.headers.common = {
        'Authorization': `bearer ${githubToken}`,
        "Content-Type": "application/json"
    }

    axios.defaults.baseURL = `https://api.github.com/repos/${url}/`;

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
    await initAxios(serviceURI)

    console.log(`Getting branches at`, serviceURI)
    if (axios.defaults.baseURL.includes(serviceURI) !== true) {
        axios.defaults.baseURL += `${serviceURI}/`
    }

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

async function runWorkflow(name, branch, environment, service) {

    const url = `actions/workflows/${name}/dispatches`;
    let res = `Error trying to initiate workflow ${name}`

    const workflowURL = `https://github.com/${getRepoURI(service)}/actions`

    try {
        const workflowInput = {
            "branch_name": branch,
            "environment": environment
        }

        console.log(`Calling github workflow ${name} with input:`, workflowInput)

        try {
            const creationRes = await axios.post(url, {
                "ref": "refs/heads/develop",
                "inputs": workflowInput
            });
            if (creationRes.status === 204) {
                res = `Success from GitHub, deployment workflow triggered successfully :bender_dance: \nProgress can be monitored in <${workflowURL}|GitHub Actions>`
            } else {
                res += `, return request status ${creationRes.status}, data: ${creationRes.data}`
            }
        } catch (err) {
            console.log(`error calling workflow`, err)
        }

    } catch (e) {
        res += `, error response: ${e.message}`;
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