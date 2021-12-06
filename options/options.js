const options = {
    mongodb: {
      host: 'mongodb://localhost/Desafio25',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      }
    }
}

module.exports = options;