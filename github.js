axios = require('axios');
axios.defaults.headers.common = {'Authorization': `bearer ${process.env.GA_TOKEN}`, "Content-Type": "application/json"}
axios.defaults.baseURL = `https://api.github.com/repos/${process.env.GA_ORGANIZATION}/${process.env.GA_PROJECT}/`;

module.exports.runDeployment = async (context) => {

    let res = {
        'success': false
    };

    const params = await getCommandParameters(context);
    res['message'] = params.message;
    if (params) {
        const workflows = await listWorkFlows();
        res['message'] += `Fetching workflow list for selected repo ... \n`
        if (workflows.workflows) {
            const workflowParam = params['server'];
            const branch = params['branch']
            const regExp = RegExp(workflowParam);

            let workFlowFile = workflows.workflows.find(element => regExp.exec(element.name));
            if (workFlowFile) {
                res['message'] += `Matching workflow found as \`${workFlowFile.name}\` \n Requesting github to run workflow \`${workFlowFile.name}\` for branch \`${branch}\` \n`
                const runRes = await runWorkflow(`${workFlowFile.name}.yml`, branch)
                res['message'] += runRes.message
                if (runRes.success) {
                    res['success'] = true
                }
            } else {
                res['message'] += `Could not find a workflow matching ${workflowParam}`
            }
        } else {
            res['message'] += `Could not get workflow list for this repo. More info: ${workflows}`
        }

    } else {
        res['message'] += params['message']
    }

    return res;
}

/**
 *
 */
async function getCommandParameters(context) {
    const errorMsg = `Error fetching branch list. More Info:`
    let res = {
        'success': false
    }
    try {
        const reqRes = await axios.get('branches')
        if (reqRes.status === 200) {
            const branches = reqRes.data;

            let branchRes = matchBranchName(context, branches);

            if (branchRes) {
                res = {
                    'success': true,
                    'branch': branchRes['branch'],
                    'server': branchRes['server'],
                    'message': `Listing repo branches ... \n Found requested branch \`${branchRes['branch']}\` \n`
                }
            } else {
                res['message'] = `${errorMsg} branch provided could not be found in the branch list`
            }
        } else {
            res['message'] = `${errorMsg} ${reqRes.message}`
        }
    } catch (e) {
        res['message'] = `${errorMsg} ${e.message}`;
    }

    return res
}

function matchBranchName(context, branchList) {
    let res = false;

    for (let i = 1; i <= 2; i++) {
        let regExp = RegExp(context[i])

        const branch = branchList.find(el => el.name.search(regExp) !== -1)

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

async function runWorkflow(name, branch) {
    const url = `actions/workflows/${name}/dispatches`;
    const res = {
        'success': false,
        'message': `Error trying to initiate workflow ${name}`
    };

    try {
        const creationRes = await axios.post(url, {
            "ref": "refs/heads/develop",
            "inputs": {
                "branch_name": branch
            }
        });
        if (creationRes.status === 204) {
            res['success'] = true;
            res['message'] = 'Deployment workflow triggered successfully'
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