const express = require("express");
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));

//JSON Movie Data
let topMovies = [
    {
        title: 'The Terminator',
        director: 'James Cameron'
    },
    {
        title: 'The Terminator 2: Judgment Day',
        director: 'James Cameron'
    },
    {
        title: 'Predator',
        director: 'John McTiernan'
    },
    {
        title: 'Total Recall',
        director: 'Paul Verhoeven'
    },
    {
        title: 'True Lies',
        director: 'James Cameron'
    },    
    {
        title: 'Commando',
        director: 'Mark L. Lester'
    },
    {
        title: 'The Running Man',
        director: 'Paul Michael Glaser'
    },
    {
        title: 'The Last Action Hero',
        director: 'John McTiernan'
    },
    {
        title: 'Conan the Barbarian',
        director: 'John Milius'
    },
    {
        title: 'Terminator 3: Rise of thhe Machines',
        director: 'Jonathan Mostow'
    },
];

//Get Requests
app.get('/movies', (req, res) =>{
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Welcome to my myFlix app!');
});

//static file route
app.use(express.static('public'));

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

//Listen for Requests
app.listen(8080, () =>{
    console.log('Your App is listening on port 8080');
});