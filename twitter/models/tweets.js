/*
    The analysis using NLP natural API is used here.
    All the tweets will be sent to the database and they will be 
    analyzed. Note that the tweets that comes from the stream have 
    different function since the JSON responce is different.
*/

let db = require('./db');
let T = require('../config/twitter');
let Sentiment = require('sentiment');
let sentiment = new Sentiment();

let param = (query) => {
    return paramDetails = {
        q: query,
        count: 100,
        tweet_mode: 'extended',
        lang: 'en'
    }
}

module.exports.updateTweets = (query) => {
    return new Promise((resolve, reject) => {
        T.get('search/tweets', param(query), (error, data, response) => {
            if (error) {
                return reject('err');
            } else {
                return analyzeTweets(data)
                    .then((analyzedTweets) => db.updateTweetsDB(query, analyzedTweets))
                    .then(() => resolve('done'))
                    .catch(err => console.log(err));
            }
        });
    })
}

let analyzeTweets = module.exports.analyzeTweets = (data) => {

    return new Promise((resolve) => {
        let tweets = new Array();
        let alltweets = data.statuses;
        for (let i = 0; i < alltweets.length; i++) {
            let tweet = new Object();
            ('retweeted_status' in alltweets[i]) ? tweet.text = alltweets[i].retweeted_status.full_text: tweet.text = alltweets[i].full_text;
            if (alltweets[i].hasOwnProperty('extended_entities')) {
                tweet.img = new Array();
                for (let n = 0; n < alltweets[i].extended_entities.media.length; n++) {
                    tweet.img[n] = alltweets[i].extended_entities.media[n].media_url
                }
            }
            tweet.repeated = repeatedLetterCounter(tweet.text);
            let sentimentResult = sentiment.analyze(tweet.text);
            tweet.sentiment = sentimentResult.score;
            tokens = tweet.text.split(" ");
            for (let n = 0; n < tokens.length; n++) {
                let sentimentTokenResult = sentiment.analyze(tokens[n]);
                if (sentimentTokenResult.score > 0) {
                    tokens[n] = '<font color="green">' + tokens[n] + '</font>';
                } else if (sentimentTokenResult.score < 0) {
                    tokens[n] = `<font color="red">${tokens[n]}</font>`;
                }
            }
            tweet.text = tokens.join(' ');
            tweets.push(tweet);
            resolve(tweets);
        }
    });
}

module.exports.analyzeStream = (data) => {
    return new Promise((resolve) => {
        let tweet = new Object();
        tweet.text = data;
        tweet.repeated = repeatedLetterCounter(data);
        sentimentResult = sentiment.analyze(data);
        tweet.sentiment = sentimentResult.score;
        tokens = tweet.text.split(" ");
        for (let n = 0; n < tokens.length; n++) {
            let sentimentTokenResult = sentiment.analyze(tokens[n]);
            if (sentimentTokenResult.score > 0) {
                tokens[n] = '<font color="green">' + tokens[n] + '</font>';
            } else if (sentimentTokenResult.score < 0) {
                tokens[n] = `<font color="red">${tokens[n]}</font>`;
            }
        }
        tweet.text = tokens.join(' ');
        resolve(tweet);
    });
}

function repeatedLetterCounter(str) {
    str = str.toLowerCase();
    str = str.replace('#', '');
    str = str.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
    str = str.replace('@', '');
    var wordArray = str.split(" ");

    var results = [];
    var count = 0;
    for (var i = 0; i < wordArray.length; i++) {
        var word = wordArray[i];
        var countThisWordsBestLetter = 0;
        for (var a = 0; a < word.length; a++) {
            var countLetter = 0;
            var letter = word[a];
            for (var b = a + 1; b < word.length; b++) {
                var nextLetter = word[b];
                if (letter === nextLetter) {
                    countLetter += 1;
                }
            }
            if (countLetter > countThisWordsBestLetter) {
                countThisWordsBestLetter = countLetter;

            }
        }
        if (countThisWordsBestLetter > count) {
            // forget any words we gathered before:
            results = [];
        }
        if (countThisWordsBestLetter >= count) {
            count = countThisWordsBestLetter;
            results.push(wordArray[i]);
        }
    }
    return results;
}