const mongoose = require('mongoose');
const options = require('../../options/options');
const util = require('util');

class MongoContainer {
  constructor(collection, schema) {
    this.collection = mongoose.model(collection, schema);
    this.init();
  }
  
  async init() {
    if (!this.conexion) {
      this.conexion = await mongoose.connect(options.mongodb.host, options.mongodb.options);
    }
  }
  async createUser (user) {
      try{
        console.log(user);
        const document = await new this.collection(user);
        const response = await document.save()
        console.log('Cliente creado', {response});
        return document._id;
      } catch (error) {
          console.error('Error: ', error);
      }
  }
  async findUser (userName) {
    try{
      const user = await this.collection.findOne({username: userName}, {__v: 0});
      return user;
    }catch(err){console.error(`Error: ${err}`)}
  }
  async getById (id) {
    try{
        const documents = await this.collection.find({ _id: id },{__v:0});
        if ( documents.length === 0 || documents===undefined) {
            return false;
        } else {
            return documents[0];
        }
      } catch (error) {
          console.error('Error: ', error);
      }
  }
  async deleteById(id) {
    try {
      const response = await this.collection.deleteOne({ _id: id });
      console.log('deleteById: ', {response});
    }catch (error) {
      console.error('Error:', error);
    };
  }
}
module.exports = MongoContainer;