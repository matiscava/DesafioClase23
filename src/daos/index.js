const ProductsDaoMongo = require('./Products/ProductsDaoMongo');
const UsersDaoMongo = require('./Users/UserDaoMongo')

const daos= {};
daos['usersDao'] = UsersDaoMongo;
daos['productsDao'] = ProductsDaoMongo;

module.exports = daos;

