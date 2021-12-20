const { Schema } = require('mongoose');

const MongoContainer = require("../../containers/MongoContainer");

class UserDaoMongo extends MongoContainer {
  constructor() {
    super('users', new Schema({
        username: {type: String, required:true},
        email: {type: String, required:true},
        password: {type: String, required:true}
      }))
  }
};

module.exports = UserDaoMongo;