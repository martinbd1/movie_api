const express = require("express");
morgan = require('morgan');
bodyParser = require('body-parser');
uuid = require('uuid');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());


//JSON User Data
let users = [{
    id: '1',
    username: 'Brian',
    email: 'martinbd1@gmail.com',
    birthday: '07/23/1987',
    favorites: []
}]

//JSON Movie Data
let movies = [{
        title: 'The Terminator',
        year: '1984',
        genre: {
            name: 'Action',
            description: '-',
        },
        director: {
            name: 'James Cameron',
            birth: '1954',
            death: '-',
            bio: '-',
        },
        imgUrl: '-',
        featured: ''
    },
    {
        title: 'Terminator 2: Judgment Day',
        year: '1991',
        genre: {
            name: 'Action',
            description: '-',
        },
        director: {
            name: 'James Cameron',
            birth: '1954',
            death: '-',
            bio: '-',
        },
        imgUrl: '-',
        featured: ''
    },
    {
        title: 'Predator',
        year: '1987',
        genre: {
            name: 'Action',
            description: '-',
        },
        director: {
            name: 'John McTiernan',
            birth: '1951',
            death: '-',
            bio: '-',
        },
        imgUrl: '-',
        featured: ''
    },
    {
        title: 'Total Recall',
        year: '1990',
        genre: {
            name: 'Action',
            description: '',
        },
        director: {
            name: 'Paul Verhoeven',
            birth: '1938',
            death: '-',
            bio: '-',
        },
        imgUrl: '-',
        featured: ''
    },
    {
        title: 'True Lies',
        year: '1994',
        genre: {
            name: 'Action',
            description: '-',
        },
        director: {
            name: 'James Cameron',
            birth: '1954',
            death: '-',
            bio: '-',
        },
        imgUrl: '-',
        featured: ''
    },
    {
        title: 'Commando',
        year: '1985',
        genre: {
            name: 'Action',
            description: '-',
        },
        director: {
            name: 'Mark L. Lester',
            birth: '1946',
            death: '-',
            bio: '-',
        },
        imgUrl: '-',
        featured: ''
    },
    {
        title: 'The Running Man',
        year: '1987',
        genre: {
            name: 'Action',
            description: '-',
        },
        director: {
            name: 'Paul Michael Glaser',
            birth: '1943',
            death: '-',
            bio: '-',
        },
        imgUrl: '-',
        featured: ''
    },
    {
        title: 'Conan the Barbarian',
        year: '1982',
        genre: {
            name: 'Action',
            description: '-',
        },
        director: {
            name: 'John Milius',
            birth: '1944',
            death: '-',
            bio: '-',
        },
        imgUrl: '-',
        featured: ''
    },
];


//Get Requests
app.get('/', (req, res) => {
    res.send('Welcome to my myFlix app!');
});

//Get all movies (1)
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

app.get('/users', (req, res) => {
    res.status(200).json(users);
});


//GET Request for a sinlge movie, by title (2)
app.get('/movies/:title', (req, res) => {
    const movie = movies.find((movie) => movie.title === req.params.title)

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('Movie not found!')
    }
});


//GET Request for a sinlge movie, by title, genre (3)
app.get('/movies/genres/:genre', (req, res) => {
    const genre = movies.find((movie) => movie.genre.name === req.params.genre).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('Genre not found!')
    }
});


//GET Request for a director (4)
app.get('/movies/directors/:name', (req, res) => {
    const director = movies.find((movie) => movie.director.name === req.params.name).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('Director not found!')
    }
});


//POST add user (5)
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.username) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    } else {
        res.status(400).send('Missing "name" in request body');
    }
});


//PUT Update the username of a user (6)
app.put('/users/:username', (req, res) => {
    const newUsername = req.body;

    let user = users.find((user) => {
        return user.username === req.params.username
    });

    if (user) {
        user.username = newUsername.username;
        res.status(200).send('User ' + req.params.username + ' was updated');
    } else {
        res.status(404).send('User ' + req.params.username + ' was not found.');
    }
});


//POST add favorite movie (7)
app.post('/users/:username/:movie', (req, res) => {

    let user = users.find((user) => {
        return user.username === req.params.username
    });

    if (user) {
        user.favorites.push(req.params.movie);
        res.status(200).send(req.params.movie + ' was added to favorites');
    } else {
        res.status(400).send('User not found');
    }
});


//DELETE remove movie from favories list (8)
app.delete('/users/:username/:movie', (req, res) => {

    let user = users.find((user) => {
        return user.username === req.params.username
    });

    if (user) {
        user.favorites = user.favorites.filter((mov) => {
            return mov !== req.params.movie
        });
        res.status(200).send(req.params.movie + ' was removed from favorites');
    } else {
        res.status(400).send('User not found');
    }
});


//DELETE user (9)
app.delete('/users/:username', (req, res) => {

    let user = users.find((user) => {
        return user.username === req.params.username
    });

    if (user) {
        user = users.filter((user) => {
            return user.username !== req.params.username
        });
        res.status(200).send(req.params.username + ' was deleted');
    } else {
        res.status(400).send('User not found');
    }
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