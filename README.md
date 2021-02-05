# Amplify Function with DynamoDB Local Demo

This is a small project to demonstrate connecting a Lambda function to a DynamoDB table generated from a GraphQL model defined using [AWS Amplify](https://aws.amazon.com/amplify/).
It's purpose is mainly to demonstrate that, presently, this will not work locally using [`amplify mock`](https://docs.amplify.aws/cli/usage/mock).

This project [defines a GraphQL API](amplify/backend/api/localdb/schema.graphql) that has a single entity, `Message`.
Every message has the properties `ID` and `content`.
Amplify will generate a `Messages` DynamoDB table from the GraphQL `Message` model.
This entity is defined as requiring authentication to create, read, update, and list.
Authentication is provided through Amazon Cognito User Pool.
(See ["Added a GraphQL API"](#added-a-graphql-api) below.)

This project also [defines a Lambda function](amplify/backend/function/addMessage/src/index.js) `newMessage` that, when invoked, should create a new item in the `Messages` table.
At the moment, invoking this function when deployed to AWS will have the intended effect.
When invoking this function locally using `amplify mock`, however, the function will time out, unable to connect to the DynamoDB Local instance.


## How this repo was created

After bootstrapping with `create-react-app` and `amplify init`, here were the following selections of answers for the given steps.


### Added a GraphQL API

```
❯ amplify add api
Scanning for plugins...
Plugin scan successful
? Please select from one of the below mentioned services: GraphQL
? Provide API name: localdb
? Choose the default authorization type for the API Amazon Cognito User Pool
Using service: Cognito, provided by: awscloudformation

 The current configured provider is Amazon Cognito.

 Do you want to use the default authentication and security configuration? Default configuration
 Warning: you will not be able to edit these selections.
 How do you want users to be able to sign in? Email
 Do you want to configure advanced settings? No, I am done.
Successfully added auth resource localdb669df4cf locally

Some next steps:
"amplify push" will build all your local backend resources and provision it in the cloud
"amplify publish" will build all your local backend and frontend resources (if you have hosting category added) and provision it in the cloud

? Do you want to configure advanced settings for the GraphQL API No, I am done.
? Do you have an annotated GraphQL schema? No
? Choose a schema template: Single object with fields (e.g., “Todo” with ID, name, description)

The following types do not have '@auth' enabled. Consider using @auth with @model
	- Todo
Learn more about @auth here: https://docs.amplify.aws/cli/graphql-transformer/directives#auth


GraphQL schema compiled successfully.

Edit your schema at /Users/chris/development/amplify-localdb-demo/amplify/backend/api/localdb/schema.graphql or place .graphql files in a directory at /Users/chris/development/amplify-localdb-demo/amplify/backend/api/localdb/schema
? Do you want to edit the schema now? No
Successfully added resource localdb locally

Some next steps:
"amplify push" will build all your local backend resources and provision it in the cloud
"amplify publish" will build all your local backend and frontend resources (if you have hosting category added) and provision it in the cloud
```

### Added a function with

```
❯ amplify add function
? Select which capability you want to add: Lambda function (serverless function)
? Provide an AWS Lambda function name: addMessage
? Choose the runtime that you want to use: NodeJS
? Choose the function template that you want to use: Hello World

Available advanced settings:
- Resource access permissions
- Scheduled recurring invocation
- Lambda layers configuration

? Do you want to configure advanced settings? Yes
? Do you want to access other resources in this project from your Lambda function? Yes
? Select the category storage
Storage category has a resource called Message:@model(appsync)
? Select the operations you want to permit for Message:@model(appsync) create

You can access the following resource attributes as environment variables from your Lambda function
	API_LOCALDB_GRAPHQLAPIIDOUTPUT
	API_LOCALDB_MESSAGETABLE_ARN
	API_LOCALDB_MESSAGETABLE_NAME
	ENV
	REGION
? Do you want to invoke this function on a recurring schedule? No
? Do you want to configure Lambda layers for this function? No
? Do you want to edit the local lambda function now? No
Successfully added resource addMessage locally.

Next steps:
Check out sample function code generated in <project-dir>/amplify/backend/function/addMessage/src
"amplify function build" builds all of your functions currently in the project
"amplify mock function <functionName>" runs your function locally
"amplify push" builds all of your local backend resources and provisions them in the cloud
"amplify publish" builds all of your local backend and front-end resources (if you added hosting category) and provisions them in the cloud
```

## Running locally with amplify mock

### Start the API mock

You will need to start the API mock service in order to have a running DynamoDB Local instance.
This will create a `Messages` table (although the actual table name will probably have a randomized string appendend to the name).
Our Lambda will attempt to write a message to the `Messages` table set up through this step.

From a shell, start the API mock service with
```
amplify mock api
```

Note that this will occupy the shell's session; you will need to leave this running while trying to run the Lambda function (described below) in a new shell.


### Run the Lambda function

From a separate shell, run the Lambda function locally with

```
amplify mock function addMessage
```

You will be prompted to provide an event JSON object:
```
? Provide the path to the event JSON object relative to /Users/chri
s/development/amplify-localdb-demo/amplify/backend/function/addMess
age (src/event.json)
```

Hit <kbd>Enter</kbd> to use the default (`src/event.json`).
(The actual content does not matter, other than needing to be a valid JSON object.)

Note that presently we expect this to fail, with `addMessage` unable to connect to the DynamoDB Local instance set up by `amplify mock api` in the step above.
You should see an error like the following:

```
addMessage failed with the following error:
Error: Lambda execution timed out after 10 seconds. Press ctrl + C to exit the process.
    To increase the lambda timeout use the --timeout parameter to set a value in seconds.
    Note that the maximum Lambda execution time is 15 minutes:
    https://aws.amazon.com/about-aws/whats-new/2018/10/aws-lambda-supports-functions-that-can-run-up-to-15-minutes/

    at Timeout._onTimeout (/Users/chris/.nodenv/versions/14.15.1/lib/node_modules/@aws-amplify/cli/node_modules/amplify-util-mock/lib/func/index.js:94:63)
    at listOnTimeout (internal/timers.js:554:17)
    at processTimers (internal/timers.js:497:7)
Finished execution.
```
