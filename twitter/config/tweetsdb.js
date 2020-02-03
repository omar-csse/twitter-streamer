/*
    Connection to mongodb for the tweets that comes from the search/filter API 
*/

const MongoClient = require('mongodb').MongoClient

class TweetsConnection {
    static async connectToDB() {
        await initTwitterDB();
        return await MongoClient.connect(this.url, {useNewUrlParser:true, useUnifiedTopology:true }, this.options)
            .then(client => {this.db = client.db('tweets')})
            .then(() => console.log('tweets DB in tweets cluster is connected'))
            .catch(err => console.log(err));
    }
}

const initTwitterDB  = async () => {
    TweetsConnection.db = null
    TweetsConnection.url = process.env.TWEETSDB_URI
    TweetsConnection.options = {
        bufferMaxEntries: 0,
        reconnectTries: 5000,
    }
}

module.exports = TweetsConnection;