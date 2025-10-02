// services/audit.service.js
const db = require("../models"); // ✅ Import full db object (after index.js loads all)

class AuditService {
  async log(action, entity, entityId, details, performer) {
    try {
      // ✅ Validate performer
      if (!performer || !performer.id) {
        console.warn("Audit log skipped: missing performer identity");
        return;
      }

      // ✅ Fallback username
      const username = performer.username || performer.email || `User#${performer.id}`;

      // ✅ Ensure action is allowed
      const validActions = [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_CREATE',
        'USER_UPDATE',
        'USER_DELETE',
        'USER_PASSWORD_RESET',
        'USER_STATUS_CHANGE',
        'MEDICINE_CREATE',
        'MEDICINE_UPDATE',
        'ORDER_CREATE',
        'PRESCRIPTION_FULFILL'
      ];

      if (!validActions.includes(action)) {
        console.warn(`Invalid audit action ignored: ${action}`);
        return;
      }

      // ✅ Create log
      await db.AuditLog.create({
        action,
        entity,
        entityId,
        details,
        performedById: performer.id,
        performedByUsername: username // ✅ Never null
      });

      console.log(`📝 Audit logged: ${action} by ${username}`);
    } catch (err) {
      console.error("❌ Failed to write audit log:", err.message);
      // 🛑 Never throw — don't break business logic
    }
  }

  async getUserLogs(userId) {
    try {
      return await db.AuditLog.findAll({
        where: { performedById: userId },
        include: [{
          model: db.User,
          as: 'Performer',
          attributes: ['username', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit: 50
      });
    } catch (err) {
      console.error("Failed to fetch user logs:", err.message);
      return [];
    }
  }

  async getAllLogs(limit = 100) {
    try {
      return await db.AuditLog.findAll({
        include: [{
          model: db.User,
          as: 'Performer',
          attributes: ['username', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit
      });
    } catch (err) {
      console.error("Failed to fetch all logs:", err.message);
      return [];
    }
  }
}

module.exports = new AuditService();