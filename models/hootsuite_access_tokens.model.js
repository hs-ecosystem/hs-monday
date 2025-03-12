module.exports = (sequelize, Sequelize) => {
  const HootsuiteAccessTokens = sequelize.define('hootsuite_access_tokens', {
    monday_id: {
      type: Sequelize.STRING,
    },
    hootsuite_uid: {
      type: Sequelize.STRING,
      unique: true,
    },
    access_token: {
      type: Sequelize.STRING(3000),
    },
    refresh_token: {
      type: Sequelize.STRING(3000),
    },
    timezone: {
      type: Sequelize.STRING,
    },
    expires_at: {
      type: Sequelize.DATE,
    },
  })

  return HootsuiteAccessTokens
}
