const UserDaoMongo = require('./Users/UserDaoMongo')

const daos= {};
daos['userDao'] = UserDaoMongo;

module.exports = daos;

