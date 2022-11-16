const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const dynamoConnection = require('./services/dynamoConnection');

app.get('/view1', async (req, res) => {
    try {
        res.status(200).send(JSON.parse(await dynamoConnection.getView1ById(req.query.id)));
    } catch (err) {
        res.status(500).send(err);
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});