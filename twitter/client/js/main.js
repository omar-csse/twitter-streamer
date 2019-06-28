/*
    link the enter button on keyboard to the search button.
*/
initStorage();
let streamInterval;
let socket = io();
let errorDOM =
    '<head>' +
    '<link rel="stylesheet" type="text/css" href="../css/error.css">' +
    '<body>' +
    '<div class="error-page">' +
    '<div>' +
    '<h1 data-h1="500">500</h1>' +
    '<p data-p="SERVER ERROR">SERVER ERROR</p>' +
    '</div>' +
    '</div>' +
    '</body>'

$(document).keypress((e) => {
    if (e.which == 13) {
        searchBtnClicked();
        e.preventDefault();
    }
});

window.onload = function () {
    if (JSON.parse(sessionStorage.input) !== '') {
        $('#search-box').val(JSON.parse(sessionStorage.input));
    }
    if (JSON.parse(sessionStorage.streamFlag)) {
        socket.emit('stream', {streamON: false});
        $('#search-btn:hover').css('cursor','default');
        $("#search-box").val('');
        $("#search-box").prop('disabled', true); 
        $("#search-btn").prop("disabled", true);
        $('#search-btn').css('background','#ff4d4d');
        $('#numOfTweets').html(`Number of tweets: ${JSON.parse(sessionStorage.numStream)}`);
        $('#AvgSentiment').html(`Average sentiment: ${JSON.parse(sessionStorage.avgStream)/JSON.parse(sessionStorage.numStream)}`);
        $('#numOfTweets').show();
        $('#AvgSentiment').show();
    }
    if (JSON.parse(sessionStorage.tweetsFlag)) {
        let currentT = JSON.parse(sessionStorage.currentNumberOfTweets);
        showTweets(0, currentT);   
    }
}

/*
    user input validation function. Alsom use the AJAX 
    call to get the tweets data from the router (server). 
    Save the needed data in the sessionStorage. After 
    that, show the tweets on a table.
*/
function searchBtnClicked() {
    let query = $('#search-box').val();
    clearTweets(query);
    sessionStorage.setItem('tweetsFlag', JSON.stringify(true));
    sessionStorage.setItem('input', JSON.stringify(query));
    let containsAlphaNumeric = new RegExp('(?=.*[A-Z])|(?=.*[a-z])|(?=.*[0-9])');
    try {
        if (!query) {
            throw new Error('Please fill the field');
        } else if (!containsAlphaNumeric.test(query)) {
            throw new Error('Please enter a vaild query');
        } else {
            subscribe(query, false);
        }
    } catch (error) {
        alert(error.message);
    }
}

/*
    start the stream
*/
function streamBtnClicked() {
    $('#search-btn:hover').css('cursor','default');
    $("#search-box").val('');
    $("#search-box").prop('disabled', true); 
    $("#search-btn").prop("disabled", true);
    $('#search-btn').css('background','#ff4d4d');
    $("#tweetsTable").html('');

    socket.emit('stream', {streamON: JSON.parse(sessionStorage.streamFlag)});
    $('#loader').show();
    sessionStorage.setItem('streamFlag', JSON.stringify(true));
}

/*
    pop-up model for images
*/
function imgClicked(i, n) {
    let tweets = JSON.parse(sessionStorage.tweets);
    $.sweetModal({
        width: '850px',
        height: '550px',
        content: `<img style="width:750px;height:450px;" src="${tweets[i].img[n]}">`
    });
}

/*
    show the tweets on DOM
*/
function showTweets(previousT, currentT) {
    let tweets = JSON.parse(sessionStorage.tweets);
    for (let i = previousT; i < currentT; i++) {
        let avgTweetsSentiment = JSON.parse(sessionStorage.avgTweetsSentiment);
        avgTweetsSentiment += tweets[i].sentiment;
        sessionStorage.setItem('avgTweetsSentiment', JSON.stringify(avgTweetsSentiment));
        if (tweets[i].hasOwnProperty('img')) {
            $('#tweetsTable').prepend(`<tr id=row${i}><td id=tweet${i}>${tweets[i].text}<br>`);
            $(`#tweet${i}`).append('<table id="tweetsImgTable"><tr>')
            for (let n = 0; n < tweets[i].img.length; n++) {
                $(`#tweet${i} #tweetsImgTable`).append(`<td><a href="javascript:imgClicked(${i}, ${n})"><img src="${tweets[i].img[n]}"></a></td>`);
            }
            $(`#tweet${i}`).append('</tr></table></td></tr>');
        } else {
            $('#tweetsTable').prepend(`<tr id=row${i}><td id=tweet${i}>${tweets[i].text}</td></tr>`);
        }
        if (tweets[i].sentiment > 0) {
            $(`tr#row${i}`).append(`<td><span class="circle" style="background-color:green"></td>`);
        } else if (tweets[i].sentiment < 0) {
            $(`tr#row${i}`).append(`<td><span class="circle" style="background-color:red"></td>`);
        } else {
            $(`tr#row${i}`).append(`<td><span class="circle" style="background-color:orange"></td>`);
        }
        $(`tr#row${i}`).append(`<td style='color:blue;cursor:pointer;text-decoration:underline', onclick=repeatedLetters(${i})>Repeated letters</td>`);
    }
    $('#numOfTweets').html(`Number of tweets: ${currentT}`);
    $('#AvgSentiment').html(`Average sentiment: ${JSON.parse(sessionStorage.avgTweetsSentiment)/currentT}`);
    if (currentT > 0) {
        $('#numOfTweets').show();
        $('#AvgSentiment').show();
    }
    $("#search-btn").prop("disabled", false);
    $('#search-btn').css({'cursor':'', 'background': ''});
    $('#loader').hide();
}

/*
    Show the repeated letters in all words in pop-up model
*/
function repeatedLetters(i) {

    let tweets = JSON.parse(sessionStorage.tweets);
    repeated = tweets[i].repeated;
    let dom = '<p>Words with the most repeated letters: ';
    for (let j = 0; j < repeated.length; j++) {
        dom = dom.concat(`${repeated[j]}, `);
    }
    dom.concat('</p>')

    $.sweetModal({
        height: 'min-height',
        width: '400px',
        content: dom,
        buttons: [{
            label: 'Close',
            classes: 'blueB'
        }]
    });
}

/*
    show stream on DOM
*/
function showStream(tweet) {
    $('#loader').hide();
    let avgStream = JSON.parse(sessionStorage.avgStream)
    avgStream += tweet.sentiment;
    sessionStorage.setItem('avgStream', JSON.stringify(avgStream));
    $('#tweetsTable').prepend(`<tr id=row${JSON.parse(sessionStorage.numStream)}><td id=tweet${JSON.parse(sessionStorage.numStream)}>${tweet.text}</td></tr>`);
    if (tweet.sentiment > 0) {
        $(`tr#row${JSON.parse(sessionStorage.numStream)}`).append(`<td><span class="circle" style="background-color:green"></td>`);
    } else if (tweet.sentiment < 0) {
        $(`tr#row${JSON.parse(sessionStorage.numStream)}`).append(`<td><span class="circle" style="background-color:red"></td>`);
    } else {
        $(`tr#row${JSON.parse(sessionStorage.numStream)}`).append(`<td><span class="circle" style="background-color:orange"></td>`);
    }
    sessionStorage.setItem('numStream', JSON.stringify(JSON.parse(sessionStorage.numStream)+1));
    $('#numOfTweets').html(`Number of tweets: ${JSON.parse(sessionStorage.numStream)}`);
    $('#AvgSentiment').html(`Average sentiment: ${JSON.parse(sessionStorage.avgStream)/JSON.parse(sessionStorage.numStream)}`);
    $('#numOfTweets').show();
    $('#AvgSentiment').show();
    let rowCount = $('table#tweetsTable tr:last').index() + 1;
    if (rowCount === 200) {
        for (let row = 0; row < 100; row++) {
            $(`#tweetsTable tr:last`).remove()
        }
    }
}

/*
    clear the tweets from DOM
*/
function clearTweets(input) {
    $("#search-btn").attr("disabled", false);
    $('#search-btn').css({'cursor':'', 'background': ''});
    $('#loader').hide();
    if (input === 0) {
        clearInterval(streamInterval);
        $('#search-box').val('');
        clearAllData(0);
    }
    if (!(JSON.parse(sessionStorage.input) === input)) {
        clearAllData(1);
    }
}

/*
    ajax call for getting the tweets
*/
function subscribe(query) {
    $("#search-btn").prop("disabled", true);
    $('#search-btn').css('background','#ff4d4d');
    $('#search-btn:hover').css('cursor','default');
    $('#loader').show();
    socket.emit('subscribe', {channel: query});
    $("#search-btn").prop("disabled", true);
    $('#search-btn').css('background','#ff4d4d');
    $('#search-btn:hover').css('cursor','default');
    $('#loader').show();
}

/*
    store the tweets in session storage
*/
let storeTweets = async (newTweets) => {
    await sessionStorage.setItem('tweets', JSON.stringify(newTweets.tweets));
    let currentNumberOfTweets = JSON.parse(sessionStorage.getItem('currentNumberOfTweets'));
    await sessionStorage.setItem('previousNumberOfTweets', JSON.stringify(currentNumberOfTweets));
    currentNumberOfTweets = newTweets.tweets.length;
    await sessionStorage.setItem('currentNumberOfTweets', JSON.stringify(currentNumberOfTweets));
}

/*
    initialize the storage if it's empty
*/
initStorage() {
    if (!sessionStorage.currentNumberOfTweets) {
        sessionStorage.setItem('currentNumberOfTweets', JSON.stringify(0));
    }
    if (!sessionStorage.previousNumberOfTweets) {
        sessionStorage.setItem('previousNumberOfTweets', JSON.stringify(0));
    }
    if (!sessionStorage.tweets) {
        sessionStorage.setItem('tweets', JSON.stringify([]));
    }
    if (!sessionStorage.input) {
        sessionStorage.setItem('input', JSON.stringify(''));
    }
    if (!sessionStorage.numStream) {
        sessionStorage.setItem('numStream', JSON.stringify(0));
    }
    if (!sessionStorage.avgSentiment) {
        sessionStorage.setItem('avgStreamSentiment', JSON.stringify(0));
    }
    if (!sessionStorage.avgSentiment) {
        sessionStorage.setItem('avgTweetsSentiment', JSON.stringify(0));
    }
    if (!sessionStorage.avgStream) {
        sessionStorage.setItem('avgStream', JSON.stringify(0));
    }
    if (!sessionStorage.streamFlag) {
        sessionStorage.setItem('streamFlag', JSON.stringify(false));
    }
    if (!sessionStorage.tweetsFlag) {
        sessionStorage.setItem('tweetsFlag', JSON.stringify(false));
    }
}

/*
    clear everyhthing, as well as the session storage
*/
function clearAllData(input) {
    if (JSON.parse(sessionStorage.input) !== '') {
        socket.emit('unsubscribe', {channel: JSON.parse(sessionStorage.input)});
    }
    if (input !== 1) {
        numStream = 0;
        unstream();
    } 
    avgSentiment = 0;
    $('#numOfTweets').hide();
    $('#AvgSentiment').hide();
    sessionStorage.clear();
    initStorage();
    $("#tweetsTable").html('');
}

/*
    stop the stream
*/
function unstream() {
    sessionStorage.setItem('streamFlag', JSON.stringify(false))
    socket.emit('unstream');
    $("#search-box").val('');
    $("#search-box").prop('disabled', false); 
    $("#search-btn").attr("disabled", false);
    $('#search-btn').css({'cursor':'', 'background': ''});
}

/*
    socket connection to get the tweets
*/
socket.on('tweets', (tweets) => {
    storeTweets(tweets).then(() => {
        let previousT = JSON.parse(sessionStorage.previousNumberOfTweets);
        let currentT = JSON.parse(sessionStorage.currentNumberOfTweets);
        showTweets(previousT, currentT);
    });
});

/*
    socket connection to get the stream
*/
socket.on('stream', (tweet) => {
    if (JSON.parse(sessionStorage.streamFlag)) {
        showStream(tweet.tweet);
    }
}); 

/*
    socket on error
*/
socket.on('error', () => {
    clearAllData(0);
    console.log('err');
});

/*
    socket connection
*/
socket.on('connect', () => {
    if (JSON.parse(sessionStorage.input) !== '') {
        socket.emit('subscribe', {channel: JSON.parse(sessionStorage.input)});
    }
});

/*
    socket reconnection
*/
socket.on('reconnect', () => {
    if (JSON.parse(sessionStorage.input) !== '') {
        socket.emit('subscribe', {channel: JSON.parse(sessionStorage.input)});
    }
});

/*
    socket disconnection
*/
socket.on('disconnect', () => {
    if (JSON.parse(sessionStorage.input) !== '') {
        socket.emit('subscribe', {channel: JSON.parse(sessionStorage.input)});
    }
});