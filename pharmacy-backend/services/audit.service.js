// services/audit.service.js
const db = require("../models"); // ✅ Loads ALL models via index.js

class AuditService {
  async log(action, entity, entityId, details, performer) {
    try {
      if (!performer || !performer.id) {
        console.warn("Audit log skipped: missing performer identity");
        return;
      }

      const username = performer.username || `User#${performer.id}`;

      const validActions = [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_CREATE',
        'USER_UPDATE',
        'USER_DELETE',
        'USER_PASSWORD_RESET',
        'USER_CHANGE_OWN_PASSWORD',
        'USER_STATUS_CHANGE',
        'USER_ACCESS_USER_LIST'
      ];

      if (!validActions.includes(action)) {
        console.warn(`🚫 Invalid audit action ignored: ${action}`);
        return;
      }

      // ✅ Critical: Ensure db.AuditLog is defined
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