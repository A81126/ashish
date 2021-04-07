const mongoose = require('mongoose');
const AppReviewSchema = new mongoose.Schema({
    appname: {
        type: String,
        require: true
    },
    sentimentScore: {
        type: Number,
        require: true
    },
    appstatus: {
        type: String,
        require: true
    }
})
const AppReviewModel = mongoose.model('appreview', AppReviewSchema);
module.exports = AppReviewModel;