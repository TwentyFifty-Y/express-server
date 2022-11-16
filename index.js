const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const dynamoConnection = require('./services/dynamoConnection');
const helper = require('./services/helper');

app.get('/views', async (req, res) => {
    try {
        helper.checkId(req.query.id);
        res.status(200).send(JSON.parse(await dynamoConnection.getViewById(req.query.id)));
    } catch (err) {
        res.status(500).send(err);
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});