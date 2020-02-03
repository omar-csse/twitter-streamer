/*
    Connection to mongodb for the tweets that comes from the stream/data API 
*/

const MongoClient = require('mongodb').MongoClient

class StreamConnection {
    static async connectToDB() {
        await initStreamDB();
        return await MongoClient.connect(this.url, {useNewUrlParser:true,useUnifiedTopology:true}, this.options)
            .then(client => { this.db = client.db('stream')})
            .then(() => console.log('stream DB in stream cluster is connected'))
            .catch(err => console.log(err));
    }
}

const initStreamDB = async () => {
    StreamConnection.db = null
    StreamConnection.url = process.env.STREAMDB_URI
    StreamConnection.options = {
        bufferMaxEntries: 0,
        reconnectTries: 5000,
    }
}

module.exports = StreamConnection;