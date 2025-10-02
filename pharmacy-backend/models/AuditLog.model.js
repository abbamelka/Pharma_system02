// models/AuditLog.model.js
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define("AuditLog", {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // ✅ Fix: Use flat array for isIn
        isIn: {
          args: [
'USER_LOGIN',
      'USER_LOGOUT',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_PASSWORD_RESET',
      'USER_CHANGE_OWN_PASSWORD', // ← if you added it
      'USER_STATUS_CHANGE',
      'USER_ACCESS_USER_LIST',   // ✅ ADD THIS LINE
      'MEDICINE_CREATE',
      'MEDICINE_UPDATE',
      'ORDER_CREATE',
      'PRESCRIPTION_FULFILL'

          ],
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
      allowNull: false,
      // ✅ Add length constraint
      validate: {
        len: [1, 255]
      }
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    // ✅ Enable createdAt/updatedAt
  });

  return AuditLog;
};