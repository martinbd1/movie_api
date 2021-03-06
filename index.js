const express = require("express");
morgan = require('morgan');
bodyParser = require('body-parser');
uuid = require('uuid');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const {
    check,
    validationResult
} = require('express-validator');

const cors = require('cors');
//app.use(cors()); //lets all domain allowed

let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'https://myflixapp1987.herokuapp.com/', 'https://myflix-1987.netlify.app'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

const Movies = Models.Movie;
const Users = Models.User;

app.use(morgan('common'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

const auth = require('./auth')(app);

const passport = require('passport');
const res = require("express/lib/response");
require('./passport');

//Mongoose to connect to that database
// mongoose.connect('mongodb://localhost:27017/myflixDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//Get Requests
app.get('/', (req, res) => {
    res.send('Welcome to my myFlix app!');
});


//Get all movies (1)+
app.get('/movies', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //app.get('/movies', function (req, res) { //restore when authentication middleware once you’ve given users the ability to authenticate themselves with a login form when using the client application.
    Movies.find()
        .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get all users
app.get('/users', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Users.find()
        .then((user) => {
            res.status(201).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get single user
app.get('/users/:Username', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Users.findOne({
            Username: req.params.Username
        })
        .then((user) => {
            if (user) {
                res.json(user);
            } else {
                res.status(400).send("User not found")
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//GET Request for a sinlge movie, by title (2)+
app.get('/movies/:Title', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Movies.findOne({
            Title: req.params.Title
        })
        .then((movie) => {
            if (movie) {
                res.json(movie);
            } else {
                res.status(400).send("Movie not found");
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//GET Request for a sinlge movie, by title, genre (3)+
app.get('/movies/genres/:Name', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Movies.findOne({
            'Genre.Name': req.params.Name
        })
        .then((movie) => {
            if (movie) {
                res.json(movie.Genre);
            } else {
                res.status(400).send("Genre not found");
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//GET Request for a director info (4)+
app.get('/movies/directors/:Name', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Movies.findOne({
            'Director.Name': req.params.Name
        })
        .then((movie) => {
            if (movie) {
                res.json(movie.Director);
            } else {
                res.status(400).send("Director not found");
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//POST allow user to register (5)+
app.post('/users',
    // Validation logic here for request
    //you can either use a chain of methods like .not().isEmpty()
    //which means "opposite of isEmpty" in plain english "is not empty"
    //or use .isLength({min: 5}) which means
    //minimum value of 5 characters are only allowed
    [
        check('Username', 'Username is required (min length 5)').isLength({
            min: 5
        }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {

        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);

        Users.findOne({
                Username: req.body.Username
            }) // Search to see if a user with the requested username already exists
            .then((user) => {
                if (user) {
                    //If the user is found, send a response that it already exists
                    return res.status(400).send(req.body.Username + ' already exists');
                } else {
                    Users.create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birthday: req.body.Birthday
                        })
                        .then((user) => {
                            res.status(201).json(user)
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });


//PUT allow user to update info (username) (6)+
app.put('/users/:Username', passport.authenticate('jwt', {
        session: false
    }),
    [ // Validation logic here for request
        check('Username', 'Username is required (min length 5)').isLength({
            min: 5
        }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {

        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }

        Users.findOneAndUpdate({
                Username: req.params.Username
            }, {
                $set: {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }
            }, {
                new: true
            }, // This line makes sure that the updated document is returned
            (err, updatedUser) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                } else {
                    res.json(updatedUser);
                }
            });
    });


//POST add favorite movie (7)+
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Users.findOneAndUpdate({
            Username: req.params.Username
        }, {
            $push: {
                FavoriteMovies: req.params.MovieID
            }
        }, {
            new: true
        }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


//DELETE remove movie from favories list (8)+
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Users.findOneAndUpdate({
            Username: req.params.Username
        }, {
            $pull: {
                FavoriteMovies: req.params.MovieID
            }
        }, {
            new: true
        }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


//DELETE user (9)+
app.delete('/users/:Username', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Users.findOneAndRemove({
            Username: req.params.Username
        })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Send documentation page
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {
        root: __dirname
    });
});

//static file route
app.use(express.static('public'));

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});