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
  async createUser (nombre) {
      try{
          const document = await new this.collection({nombre: nombre});
        const response = await document.save()
        console.log('Cliente creado', {response});
        return document._id;
      } catch (error) {
          console.error('Error: ', error);
      }
  }
  async getById (id) {
    try{
        const documents = await this.collection.find({ _id: id },{__v:0});
        if ( documents.length === 0 || documents===undefined) {
            return false;
        } else {
            return documents[0].nombre;
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