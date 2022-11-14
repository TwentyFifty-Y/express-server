// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'eu-central-1' });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

function searchById(id) {
    return params = {
        TableName: 'ViewsInfo',
        Key: {
          'view_id': { S: id }
        },
        ProjectionExpression: 'info'
      };
}

// Call DynamoDB to read the item from the table
ddb.getItem(searchById('view1GlobalAnnual'), function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log(data.Item.info.S);
  }
});