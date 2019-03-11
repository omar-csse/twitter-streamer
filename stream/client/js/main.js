let socket = io();

function showNumberOfTweets(tweets) {
    $('#numOfTweets').html(`${tweets}`);
}

socket.on('tweets', (data) => {
    showNumberOfTweets(data.tweets);
})