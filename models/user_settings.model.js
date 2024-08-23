module.exports = (sequelize, Sequelize) => {
  const UserSettings = sequelize.define('user_settings', {
    monday_id: {
      type: Sequelize.STRING,
    },
    hootsuite_uid: {
      type: Sequelize.STRING,
    },
    field_mappings: {
      type: Sequelize.JSON,
    },
    num_months_to_import: {
      type: Sequelize.STRING,
    },
    board_id: {
      type: Sequelize.STRING,
    },
    group_id: {
      type: Sequelize.STRING,
    },
    has_viewed_wizard: {
      type: Sequelize.STRING,
    },
  })

  return UserSettings
}
