axios = require('axios');
axios.defaults.headers.common = {'Authorization': `bearer ${process.env.GA_TOKEN}`, "Content-Type": "application/json"}
axios.defaults.baseURL = `https://api.github.com/repos/${process.env.GA_ORGANIZATION}/${process.env.GA_PROJECT}/`;

module.exports.runDeployment = async (context) => {

    let res = {
        'success': false
    };

    const params = await getCommandParameters(context);
    if (params) {
        const workflows = await listWorkFlows();
        if (workflows.workflows) {
            const workflowParam = params['server'];
            const regExp = RegExp(workflowParam);

            let workFlowFile = workflows.workflows.find(element => regExp.exec(element.name));
            if (workFlowFile) {
                //if workflow found, get the filename
                // const res = runWorkflow(found.name + '.yml');
                res = {
                    'success': true,
                    'message': `Deploying to : ${workFlowFile.name}`
                }
                console.log(`Deploying to : ${workFlowFile.name}`)
            } else {
                res['message'] = `Could not find a workflow matching ${workflowParam}`
            }
        } else {
            res['message'] = `Could get workflow list for this repo. More info: ${workflows}`
        }

    } else {
        res['message'] = params['message']
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
                //found the branch
                res = {
                    'success': true,
                    'branch': branchRes['branch'],
                    'server': branchRes['server']
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
        let regExp = /context[i]/i
        if (branchList.find(el => el.name.search(regExp)) !== -1) {
            res = {
                'branch': context[i],
                'server': context[i === 1 ? 2 : 1]
            }
            break
        }
    }

    return res

}

async function runWorkflow(name) {
    const url = `actions/workflows/${name}/dispatches`;
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
    return axios.get(`actions/workflows`)
        .then((res) => {
            return res.data;
        })
        .catch(err => {
            return err
        })

}