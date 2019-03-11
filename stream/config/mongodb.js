const MongoClient = require('mongodb').MongoClient

class Connection {
    static async connectToDB() {
        return await MongoClient.connect(this.url, {useNewUrlParser: true}, this.options)
            .then(client => this.db = client.db('stream'))
            .then(() => console.log('MongoDB is connected'))
            .catch(err => console.log(err));
    }
}

Connection.db = null
Connection.url = process.env.STREAMDB_URI
Connection.options = {
    bufferMaxEntries: 0,
    reconnectTries: 5000,
}

module.exports = Connection;