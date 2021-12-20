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
  async getAll() {
    try {
      const documents = await this.collection.find({},{__v:0})
      return documents;
    } catch (error) {
      console.error('Error:', error);
    }
  }
  async createProduct(producto) {
    try {
        const productsList = await this.getAll();
        const fecha = new Date().toLocaleString();
        let nextID = 1;
        let agregarData;
        if(productsList.length===0){
            agregarData={...producto,code:nextID,timestamp:fecha}
        }else{
            for(let i=0;i<productsList.length;i++){
                while( productsList[i].code >= nextID){
                    nextID++;
                }
            }
            agregarData={...producto,code:nextID,timestamp:fecha}
        }

      const document = await new this.collection(agregarData);
      const response = await document.save()

      console.log('create new product: ', {response});
      return document._id; 
    } catch (error) {
      console.error(error); throw error;
    }
  }
  async createUser (user) {
      try{
        const document = await new this.collection(user);
        const response = await document.save()
        console.log('Cliente creado', response);
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
  async update(id, element) {
    const fecha = new Date().toLocaleString();

    const { n, nModified } = await this.collection.updateOne({ _id: id }, {
      $set: {element,timestamp:fecha}
    })
    if (n == 0 || nModified == 0) {
      console.error(`Elemento con el id: '${id}' no fue encontrado`);
      return null;
    }

    const elementUpdated = await this.getById(id);

    return elementUpdated;
  }
  async deleteById(id) {
    try {
      const response = await this.collection.deleteOne({ _id: id });
      console.log('deleteById: ', {response});
    }catch (error) {
      console.error('Error:', error);
    };
  }
  async deleteAll() {
    try {
      await this.collection.deleteMany({});
      console.log('deleteAll: ');
    } catch (error) {
      console.error('Error:', error);
    };
  }
}
module.exports = MongoContainer;