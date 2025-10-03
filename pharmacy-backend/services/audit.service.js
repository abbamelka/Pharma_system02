const db = require("../models");

class AuditService {
  async log(action, entity, entityId, details, performer) {
    try {
      if (!performer || !performer.id) {
        console.warn("Audit log skipped: missing performer identity");
        return;
      }

      const username = performer.username || `User#${performer.id}`;

      const validActions = [
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
      ];

      if (!validActions.includes(action)) {
        console.warn(`🚫 Invalid audit action ignored: ${action}`);
        return;
      }

      if (!db.AuditLog) {
        console.error("❌ db.AuditLog is undefined – model not loaded!");
        return;
      }

      await db.AuditLog.create({
        action,
        entity,
        entityId,
        details,
        performedById: performer.id,
        performedByUsername: username
      });

      console.log(`✅ Audit logged: ${action} by ${username}`);
    } catch (err) {
      console.error("❌ DATABASE ERROR when writing audit log:", err.message);
      if (err.errors) console.error("Validation errors:", err.errors);
    }
  }

  async getAllLogs(limit = 100) {
    try {
      return await db.AuditLog.findAll({
        include: [{ model: db.User, as: 'Performer', attributes: ['username', 'role'] }],
        order: [['createdAt', 'DESC']],
        limit
      });
    } catch (err) {
      console.error("Failed to fetch logs:", err.message);
      return [];
    }
  }
}

module.exports = new AuditService();
