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

// // Call DynamoDB to read the item from the table
// ddb.getItem(searchById('view1GlobalAnnual'), function (err, data) {
//     if (err) {
//         console.log("Error", err);
//     } else {
//         console.log(data.Item.info.S);
//     }
// });

//A function that searches for a view_id and returns the info if successful
async function getView1ById(id) {
    return new Promise((resolve, reject) => {
        ddb.getItem(searchById(id), function (err, data) {
            if (!data.Item) {
                reject("No data found for id: " + id + ". Please check the id and try again.");
            } else {
                resolve(data.Item.info.S);
            }
        });
    });
}

module.exports = {
    getView1ById
}