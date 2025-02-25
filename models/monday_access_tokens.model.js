module.exports = (sequelize, Sequelize) => {
  const MondayAccessTokens = sequelize.define('monday_access_tokens', {
    monday_id: {
      type: Sequelize.STRING,
    },
    hootsuite_uid: {
      type: Sequelize.STRING,
    },
    access_token: {
      type: Sequelize.STRING(3000),
    },
  })

  return MondayAccessTokens
}
