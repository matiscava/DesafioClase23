const { Schema } = require('mongoose');

const MongoContainer = require("../../containers/MongoContainer");

class UserDaoMongo extends MongoContainer {
  constructor() {
    super('users', new Schema({
        nombre: {type: String, required:true}
    }))
  }
};

module.exports = UserDaoMongo;