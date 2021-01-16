
const express = require('express');
const natural = require('natural');
const SW = require('stopword');
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');
const router = express.Router();
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();
const { SentimentAnalyzer, PorterStemmer } = natural;

router.post('/api/analyzer', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    console.log(req.headers);
    const { review } = req.body;
    const lexReview = aposToLexForm(review);
    const casedReview = lexReview.toLowerCase();
    const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');

    const { WordTokenizer } = natural;
    tokenizer = new WordTokenizer();
    const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);

    //spelling corrector 
    tokenizedReview.forEach((word, index) => {
        tokenizedReview[index] = spellCorrector.correct(word);

    });
    //removing stop words
    const filteredReview = SW.removeStopwords(tokenizedReview);

    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const analysis = analyzer.getSentiment(filteredReview);
    res.status(200).json(analysis);


});
module.exports = router;