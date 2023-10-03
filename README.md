# Slack Deployer

## Description

Slack Deployer is a Slack App that allows you to trigger GitHub Actions Workflows for deploying your application. It
integrates with Slack using a "slash command" /deploy. When this command is used, a modal is displayed in Slack,
populated with information from the SupportedApps environment variable (see below). After selecting the desired options
and clicking "Submit" in the dialog, the selected information is sent to GitHub, triggering the corresponding workflow
with the chosen inputs. This workflow can be customized to automate various deployment tasks, such as deploying to
Kubernetes or running a code build script.hoose to do whatever your app needs to automate such a deployments to
kubernetes, call a codebuild script, etc.

The project provides a template based on [AWS SAM](https://aws.amazon.com/serverless/sam/). When deployed, the template
sets up the following resources:

- API Gateway
- Secrets Manager for storing GitHub and Slack tokens
- Lambda function (where Bolt will handle the responses)

Pending, maybe add a screenshot

## Installation

To install Slack Deployer, follow these steps:

- Run `sam deploy -g` to deploy the SAM templates and build the infrastructure for the project. During this process, you
  will be prompted to enter the necessary environment variables. Ensure that there are no white spaces in the provided
  JSONs, as the framework relies on correctly formatted values. You can use online tools
  like [Code Beautify](https://codebeautify.org/remove-extra-spaces) to remove extra spaces.

- Once the deployment process is complete, the newly created API endpoint will be displayed in your terminal. This
  endpoint is required by Slack to route backend requests.

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
