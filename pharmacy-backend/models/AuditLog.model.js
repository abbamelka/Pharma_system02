module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define("AuditLog", {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [[
            'USER_LOGIN',
            'USER_LOGOUT',
            'USER_CREATE',
            'USER_UPDATE',
            'USER_DELETE',
            'USER_PASSWORD_RESET',
            'USER_CHANGE_OWN_PASSWORD',
            'USER_STATUS_CHANGE',
            'USER_ACCESS_USER_LIST'
          ]],
          msg: "Invalid action type"
        }
      }
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    performedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    performedByUsername: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true
  });

  return AuditLog;
};
