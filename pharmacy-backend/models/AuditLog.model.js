module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define("AuditLog", {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [[
            // User actions
            'USER_LOGIN',
            'USER_LOGOUT',
            'USER_CREATE',
            'USER_UPDATE',
            'USER_DELETE',
            'USER_PASSWORD_RESET',
            'USER_CHANGE_OWN_PASSWORD',
            'USER_STATUS_CHANGE',
            'USER_ACCESS_USER_LIST',

            // Medicine actions
            'MEDICINE_CREATE',
            'MEDICINE_UPDATE',
            'MEDICINE_DELETE',
            'MEDICINE_VIEW',
            'MEDICINE_SEARCH',

            // Inventory actions
            'INVENTORY_ADD',
            'VIEW_LOW_STOCK',
            'VIEW_EXPIRING_SOON',
            // ✅ Order actions
            'ORDER_CREATE',
            'ORDER_VIEW',
            'ORDER_LIST',
            'ORDER_UPDATE_STATUS',
             // ✅ Prescription actions
            'PRESCRIPTION_CREATE',
            'PRESCRIPTION_FULFILL',
            'PRESCRIPTION_PENDING_LIST',
            'PRESCRIPTION_VIEW',
            'PRESCRIPTION_CANCEL',
            'PRESCRIPTION_SEARCH',
             // ✅ Supplier actions
            'SUPPLIER_CREATE',
            'SUPPLIER_LIST',
            'SUPPLIER_VIEW',
            'SUPPLIER_UPDATE',
            'SUPPLIER_DELETE',
            'SUPPLIER_SEARCH'
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
      type: DataTypes.JSON,
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
