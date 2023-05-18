# Slack Deployer

## Description

Slack deployer is a Slack App, used to trigger GitHub Actions Workflows, ideally with logic to deploy your application.
It is triggered via a "slash command" `/deploy`. This command will show a modal in slack with the information provided
by the environment variable named `SupportedApps` (see below). Once you click on submit in the dialog, the information
selected by the user will be provided to GitHub to the selected workflow with the selected inputs. Your workflow can
choose to do whatever your app needs to automate such a deployments to kubernetes, call a codebuild script, etc.

This project has a template based on [AWS SAM](https://aws.amazon.com/serverless/sam/), this template will spin up the
following resources:

- Api gateway
- Secrets Manager to store GitHub and Slack's token
- lambda function (where bolt will be responding)

Pending, maybe add a screenshot

## How to install it

Run `sam deploy -g` to have SAM deploy your templates to build the infrastructure for this project along with its code.
This process will prompt you for the environment variables needed by the project. Make sure to remove white spaces in
the provided JSONs so its value can be picked up correctly by the framework, online tools can be used such
as https://codebeautify.org/remove-extra-spaces.

At the end of this process the newly created API endpoint will be shown in your terminal, this will be required by slack
so it knows where to send the backend requests.

## Slack Configuration

The "frontend" version of this repo lives in slack, a new application needs to be created, official
documentation https://api.slack.com/start/building, make sure the slack app has the following settings enabled:

- `Interactivity & Shortcuts` Provide here the url created by cloudfront, make sure to add `slack/events` at the end
  since this repo used Bolt https://slack.dev/bolt-js/concepts. The end result should look
  like ```https://{aws-id}.execute-api.us-east-1.amazonaws.com/slack/events```
- `Slash Commands` Add the command `/deploy` in this section with the same url used in the previous step.
- `OAuth & Permissions` The recommended scopes are the following, feel free to modify as desired:
    - channels:history
    - chat:write
    - chat:write.public
    - commands
    - groups:history
    - im:history
    - mpim:history

## Environment variables

### AppName

This variable is used to name the project in cloudformation.

### AllowedUsers

This variable is a JSON structure with the approved users that can execute this script.
This information should come from slack, it uses slack's userNames and user Id.

````json

{
    "slack-username-user1": "slack-username-user1-id",
    "slack-username-user2": "slack-username-user1-id"
}

````

### SupportedApps

This JSON structure determines the content of the modal dialogs presented in the slack modal.
Its content it's supposed to come from `github` and the elements in here will be used to call github actions workflows.
It mainly contains
3 sections:

- `url`: This is the url for the project, and it will be used to call github's API
- `workflowName`: This is the name of the YML workflow file to provide the API
- `workflows`: Collection of possible workflows (will be presented as a dropdown in the Slack dialog). Can be used to
  provide extra information/input to the workflow.

```json
{
    "service1": {
        "url": "organization/product-name",
        "workflowName": "name-of-the-workflow-file-for-this-repo",
        "workflows": [
            {
                "name": "Deploy to QA",
                "value": "RolloutMPDQA"
            },
            {
                "name": "Deploy to Staging",
                "value": "RolloutMPDStaging"
            }
        ]
    },
    "service2": {
        "url": "organization/project-name",
        "workflowName": "name-of-the-workflow-file-for-this-repo",
        "workflows": [
            {
                "name": "Deploy to Demo",
                "value": "DeployPMBToDemo"
            }
        ]
    }
}
```
