const { Schema } = require('mongoose');

const MongoContainer = require("../../containers/MongoContainer");

class ProductsDaoMongo extends MongoContainer {
  constructor() {
    super('products', new Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      code: { type: Number, required: true },
      price: { type: Number, required: true },
      stock: { type: Number, required: true },
      photo: { type: String, required: true },
      timestamp: {type: String, required: true}
      }))
  }
};

module.exports = ProductsDaoMongo;