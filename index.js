const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')

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

app.get('/user', async (req,res) => {
    try {
        helper.checkId(req.query.id);
        res.status(200).send(await dynamoConnection.getUserbyId(req.query.id));
    } catch (err) {
        res.status(500).send(err);
    }
})
app.post('/register', async (req, res) => {                   // this one won't be protected, as it has to be visible by everybody
    console.log(req.body);

    // create hash of the password and
    const salt = bcrypt.genSaltSync(6);
    const passwordHash = bcrypt.hashSync(req.body.password, salt);


    const newUser = {
        id: uuidv4(),
        username: req.body.username,
        password: passwordHash,
        email: req.body.email
    }

    //users.push(newUser);
    console.log(newUser);

    //uhhh
    await dynamoConnection.putUserById(newUser)

    // res.send('okay')
    res.status(201).json({ status: "created" });

})

// app.post('/user', async (req,res, next)=> {
//     try {
//         res.status(200).send(await dynamoConnection.putUserById())
//     }catch (err){
//         next(err)
//     }
// })
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});