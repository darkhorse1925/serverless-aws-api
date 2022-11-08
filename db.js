const {DynamoDBClient} = require('@aws-sdk/dynamodb-client')
const client = new DynamoDBClient({})  //since serverless no need any arguements

model.exports = client
