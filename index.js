const express = require("express");
morgan = require('morgan');
bodyParser = require('body-parser');
uuid = require('uuid');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

app.use(morgan('common'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

//Mongoose to connect to that database
mongoose.connect('mongodb://localhost:27017/myflixDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//Get Requests
app.get('/', (req, res) => {
    res.send('Welcome to my myFlix app!');
});


//Get all movies (1)+
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((user) => {
            res.status(201).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//GET Request for a sinlge movie, by title (2)+
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({
            Title: req.params.Title
        })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//GET Request for a sinlge movie, by title, genre (3)+
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({
            'Genre.Name': req.params.Name
        })
        .then((movie) => {
            res.json(movie.Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//GET Request for a director info (4)+
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({
            'Director.Name': req.params.Name
        })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//POST allow user to register (5)+
app.post('/users', (req, res) => {
    Users.findOne({
            Username: req.body.Username
        })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {
                        res.status(201).json(user)
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});


//PUT allow user to update info (6)+
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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


//static file route
app.use(express.static('public'));

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

//Listen for Requests
app.listen(8080, () => {
    console.log('Your App is listening on port 8080');
});