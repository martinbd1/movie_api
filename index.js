const express = require("express");
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));

//Get Requests
app.get('/movies', (req, res) =>{
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Welcome to my myFlix app!');
});

app.get('/documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
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