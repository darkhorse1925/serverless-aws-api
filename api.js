const db = require('./db')
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  ScanCommand
} = require('@aws-sdk/client-dynamodb')
const {marshall, unmarshall} = require('@aws-sdk/util-dynamodb')

const getPost = async(event) => {
  const response = {statusCode: 200}
  try {
    const params ={
      TableName : process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({postId: event.pathParameters.postId})
    } 
    const res = await db.send(new GetItemCommand((params)))
    console.log(res.Item)
    const Item = res.Item
    response.body = JSON.stringify({
      message: "Successful getPost",
      data: (Item) ? unmarshall(Item) : {},
      rawData: Item
    })
  } catch (err) {
    response.statusCode= 500
    response.body = JSON.stringify({
      message: "error getPost",
      errMsg: err.message,
      errStack: err.stack 
    })
    console.log(err)
  }
  return response
}

const createPost = async(event) => {
  const response = {statusCode: 200}
  try {
    const body = JSON.parse(event.body)
    const params ={
      TableName : process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(body || {} )
    } 
    const createResult = await db.send(new PutItemCommand((params)))
    console.log({Item})
    response.body = JSON.stringify({
      message: "Successful createPost",
      createResult,
    })
  } catch (err) {
    response.statusCode= 500
    response.body = JSON.stringify({
      message: "error createPost",
      errMsg: err.message,
      errStack: err.stack 
    })
    console.log(err)
  }
  return response
}

//Update
const updatePost = async(event) => {
  const response = {statusCode: 200}
  try {
    const body = JSON.parse(event.body)
    const params ={
      TableName : process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({postId: event.pathParameters.postId}),
      //this expression is unique to dynamodb. # is a escape sequence to escape reserved words
      UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
      }), {}),
      ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
          ...acc,
          [`:value${index}`]: body[key],
      }), {})),
    } 

    const updateResponse = await db.send(new UpdateItemCommand((params)))
    console.log({Item})
    response.body = JSON.stringify({
      message: "Successful updatePost",
      updateResponse
    })
  } catch (err) {
    response.statusCode= 500
    response.body = JSON.stringify({
      message: "error updatePost",
      errMsg: err.message,
      errStack: err.stack 
    })
    console.log(err)
  }
  return response
}

//Delete
const deletePost= async(event) => {
  const response = {statusCode: 200}
  try {
    const params ={
      TableName : process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({postId: event.pathParameters.postId})
    } 
    const deleteResponse = await db.send(new DeleteItemCommand((params)))
    console.log({Item})
    response.body = JSON.stringify({
      message: "Successful deletePost",
      deleteResponse
    })
  } catch (err) {
    response.statusCode= 500
    response.body = JSON.stringify({
      message: "error deletePost",
      errMsg: err.message,
      errStack: err.stack 
    })
    console.log(err)
  }
  return response
}


// scan command has a limit around 1mb so wont fetch all values to overcome it have to use lastevaluatedkey
const getAllPost = async(event) => {
  const response = {statusCode: 200}
  try {
    const params ={
      TableName : process.env.DYNAMODB_TABLE_NAME,
    } 

    const {Items} = await db.send(new ScanCommand((params)))
    console.log({Items})
    response.body = JSON.stringify({
      message: "Successful getAllPost",
      data: Items.map((item)=> unmarshall(item)),
      rawData: Items
    })
  } catch (err) {
    response.statusCode= 500
    response.body = JSON.stringify({
      message: "error getAllpost",
      errMsg: err.message,
      errStack: err.stack 
    })
    console.log(err)
  }
  return response
}

module.exports = {
  getPost,
  getAllPost,
  updatePost,
  deletePost,
  createPost
}
