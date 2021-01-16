const express = require('express');
//const cors = require('cors');
const app = express();
const analyzerRoute = require('./routes/nlp');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(analyzerRoute);
//app.use(cors());

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'localhost:5000/api/analyzer');
//     next();
// });

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'index.html'));
})
const port = process.env.PORT || 5000;

app.listen(port, () => `Server running on port ${port} 🔥`);