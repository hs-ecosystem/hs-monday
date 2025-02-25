const dbConfig = require('../db/config.js')
const Sequelize = require('sequelize')
console.log('Sequelize logging off')
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  logging: false,
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.hootsuiteAccessTokens = require('./hootsuite_access_tokens.model.js')(
  sequelize,
  Sequelize
)
db.mondayAccessTokens = require('./monday_access_tokens.model.js')(
  sequelize,
  Sequelize
)
db.userSettings = require('./user_settings.model.js')(sequelize, Sequelize)

module.exports = db
