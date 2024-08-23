const isProd = process.env.NODE_ENV === 'production'

const config = {
  HOST: isProd ? process.env.DB_HOST : process.env.LOCAL_DB_HOST,
  USER: isProd ? process.env.DB_USER : process.env.LOCAL_DB_USER,
  PASSWORD: isProd ? process.env.DB_PASSWORD : process.env.LOCAL_DB_PASSWORD,
  DB: isProd ? process.env.DB_DATABASE : process.env.LOCAL_DB_DATABASE,
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

module.exports = config
