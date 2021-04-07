const express = require('express');
const upload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const AppReviewModel = require('./model/AppReview');
const aposToLexForm = require('apos-to-lex-form');
const natural = require('natural');
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();
const { ensureAuthenticated } = require('./config/auth');

const router = express.Router();

router.get('/uploadreview', ensureAuthenticated, (req, res) => {
    res.render('uploadreview');
})
router.get('/', (req, res) => {
    res.render('index');
})


router.get('/detector', (req, res) => {
    res.render('detector');
})
router.post('/detector', (req, res) => {
    const { appname } = req.body;

    AppReviewModel.findOne({ appname }).then(result => {
        console.log(result);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(201).json([]);
        }

    }).catch(err => console.log(err));
})

router.post('/uploadreview', (req, res, next) => {
    if (req.files) {
        console.log(req.files);
        let file = req.files.file;
        let filename = file.name;
        file.mv('./uploads/' + filename, (err) => {
            let messages = "";
            if (err) {
                res.send('error occured');
            } else {
                let rawdata = fs.readFileSync(__dirname + '/uploads/' + filename);
                let student = (rawdata.toString());
                console.log(student);
                const rev = student.split(',');
                let size = rev.length;
                let sentimentScore = 0;
                let appstatus = "";

                for (let i = 0; i < size - 1; i++) {

                    /* NORMALIZATION */

                    // negation handling
                    // convert apostrophe=connecting words to lex form
                    const lexedReview = aposToLexForm(rev[i]);

                    // casing
                    const casedReview = lexedReview.toLowerCase();

                    // removing
                    const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');

                    // tokenize review
                    const { WordTokenizer } = natural;
                    const tokenizer = new WordTokenizer();
                    const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);

                    // spell correction
                    tokenizedReview.forEach((word, index) => {
                        tokenizedReview[index] = spellCorrector.correct(word);
                    })

                    // remove stopwords
                    const filteredReview = SW.removeStopwords(tokenizedReview);

                    const { SentimentAnalyzer, PorterStemmer } = natural;
                    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');

                    sentimentScore += analyzer.getSentiment(filteredReview);


                }
                if (sentimentScore > 0) {
                    appstatus = "Positive ";
                } else if (sentimentScore < 0) {
                    appstatus = "Negative";
                } else {
                    appstatus = "Neutral";
                }
                const appname = (filename.split('.')[0]).toLowerCase();
                const appReviewModel = new AppReviewModel({
                    appname,
                    sentimentScore,
                    appstatus
                })
                appReviewModel.save()
                    .then(result => {
                        console.log(result);
                        // delete file
                        fs.unlink('uploads/' + filename, function (err) {
                            if (err) throw err;
                            //console.log('successfully deleted ' + req.files.path);
                            messages = "Uploaded Successfully";
                            res.status(200);
                            res.render('uploadreview', { messages });
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        messages = "Error while uploading your file";
                        res.status(201);
                        res.render('uploadreview', { messages });
                    });

            }
        });
    }
})

module.exports = router;