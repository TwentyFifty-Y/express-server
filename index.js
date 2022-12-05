const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express();
app.use(cors());

app.use(express.json());

const PORT = 3000;

const dynamoConnection = require('./services/dynamoConnection');
const helper = require('./services/helper');

/*********************************************
 * HTTP Basic Authentication
 * Passport module used
 * http://www.passportjs.org/packages/passport-http/
 ********************************************/
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy

passport.use(new BasicStrategy(
    async function (username, password, done) {

        // search matching username from our user storage
        const user = await dynamoConnection.getUserByUsername(username);

        // if match is found, compare the password
        if (user != null) {
            // if password match, then proceed to route handler (the protected resource)
            if (bcrypt.compareSync(password, user.password.S)) {
                done(null, user)
            } else {
                console.log("Password not found")
                done(null, false, { message:"HTTP Basic password not found" })
            }
        } else {
            // reject the request
            console.log("Username not found")
            done(null, false, { message: "HTTP Basic username not found" });
        }
    }
));

/*********************************************
 * JWT authentication
 * Passport module is used, see documentation
 * http://www.passportjs.org/packages/passport-jwt/
 ********************************************/
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

jwtSecretKey = process.env.JWTKEY

let options = {}

/* Configure the passport-jwt module to expect JWT
   in headers from Authorization field as Bearer token */
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = jwtSecretKey;

// passport.use(new JwtStrategy(options, function (jwt_payload, done) {
//     console.log("Processing JWT payload for token content:");
//     console.log(jwt_payload);
// }));

passport.use(new JwtStrategy(options, function (jwt_payload, done) {
    console.log("Processing JWT payload for token content:");
    console.log(jwt_payload);
}));

/*********************************************
 * User sign up and login
 * User deletion
 ********************************************/
app.get('/user', async (req, res) => {
    try {
        helper.checkId(req.query.username);
        res.status(200).send(await dynamoConnection.getUserByUsername(req.query.username));
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post('/register', async (req, res) => {
    console.log(req.body);

    // create hash of the password
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

    await dynamoConnection.postUser(newUser)

    // res.send('okay')
    res.status(201).json({ status: "created" });
})

app.post('/jwtLogin', passport.authenticate('basic', { session: false }), (req, res) => {
        const body = {
            id: req.user.id,
            email: req.user.email,
            username: req.user.username
        };

        const payload = {
            user: body,
        };

        const options = {
            expiresIn: '1d'
        }

        /* Sign the token with payload, key and options. */
        const token = jwt.sign(payload, jwtSecretKey, options);

        return res.json({ token });
    })


app.delete('/user', async (req, res) => {
    try {
        helper.checkId(req.query.username);
        res.status(200).send(await dynamoConnection.deleteUser(req.query.username));
    } catch (err) {
        res.status(500).send(err);
    }
})

/*********************************************
 * Handling data for views
 ********************************************/
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