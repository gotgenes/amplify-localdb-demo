/* Amplify Params - DO NOT EDIT
	API_LOCALDB_GRAPHQLAPIIDOUTPUT
	API_LOCALDB_MESSAGETABLE_ARN
	API_LOCALDB_MESSAGETABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const uuid = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DDB_ENDPOINT
});

const params = {
  TableName: process.env.API_LOCALDB_MESSAGETABLE_NAME,
  Item: {
    id: uuid.v4(),
    message: 'This is the message'
  }
};

async function createItem() {
  await docClient.put(params).promise();
}

exports.handler = async (event) => {
  try {
    await createItem();
    return { body: 'Successfully created item!' };
  } catch (err) {
    return { error: err };
  }
};
