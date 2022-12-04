require('dotenv').config();

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({
    maxRetries: 3,
    httpOptions: { timeout: 30000, connectTimeout: 5000 },
    region: 'eu-central-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });


function createSearchUserParam(username) {
    return params = {
        TableName: 'Users',
        Key: {
            'username': { S: username }
        }
    };
}

async function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        ddb.getItem(createSearchUserParam(username), function (err, data) {
            if (!data) {
                reject("User not found!");
            } else {
                resolve(data.Item);
            }
        });
    });
}

//function pushUserToDB()
function createPostUserParams(userObject) {
    return params = {
        TableName: "Users",
        Item: {
            "username": { S: userObject.username },
            "email": { S: userObject.email },
            "password": { S: userObject.password },
            "id": { S: userObject.id },
        },
    };
}
async function postUser(userObject) {
    return new Promise((resolve, reject) => {
        ddb.putItem(createPostUserParams(userObject), function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data);
                resolve(data)
            }
        });
    });
}

// function deleteUser()
function createDeleteUserParam(username) {
    return params = {
        TableName: 'Users',
        Key: {
            'username': { S: username }
        }
    };
}
async function deleteUser(username) {
    return new Promise((resolve, reject) => {
        ddb.deleteItem(createDeleteUserParam(username), function (err, data) {
            if (err) {
                console.log("Error in deleting user", err);
            } else {
                console.log("Success in deleting user", data);
                resolve(data)
            }
        });
    });
}



//Return a params variable with the id set as the first parameter
function searchById(id) {
    return params = {
        TableName: 'ViewsInfo',
        Key: {
            'view_id': { S: id }
        },
        ProjectionExpression: 'info'
    };
}

//A function that searches for a view_id and returns the info if successful
async function getViewById(id) {
    return new Promise((resolve, reject) => {
        ddb.getItem(searchById(id), function (err, data) {
            try {
                resolve(data.Item.info.S)
            } catch (error) {
                reject(`The following error ocurred while looking for the view_id: ${id}. \n${error}`);
            }
        });
    });
}

module.exports = {
    getUserByUsername,
    getViewById,
    postUser,
    deleteUser
}