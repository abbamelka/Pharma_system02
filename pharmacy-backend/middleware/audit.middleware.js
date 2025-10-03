// middleware/audit.middleware.js
const auditService = require("../services/audit.service");

const ACTION_MAP = {
  "POST:/users/register": "USER_CREATE",
  "DELETE:/users/:id": "USER_DELETE",
  "PATCH:/users/:id/status": "USER_STATUS_CHANGE",
  "POST:/users/reset-password": "USER_PASSWORD_RESET",
  "POST:/orders": "ORDER_CREATE",
  "POST:/prescriptions": "PRESCRIPTION_CREATE",
  "PATCH:/prescriptions/:id/fulfill": "PRESCRIPTION_FULFILL",
  "PATCH:/prescriptions/:id/cancel": "PRESCRIPTION_CANCEL",
  "POST:/medicine": "MEDICINE_CREATE",
  "PUT:/medicine/:id": "MEDICINE_UPDATE",
  "DELETE:/medicine/:id": "MEDICINE_DELETE",
  "POST:/medicine/:medicineId/inventory": "INVENTORY_ADD"
};

function getRouteKey(method, path) {
  return `${method}:${path}`;
}

module.exports = (req, res, next) => {
  const routeKey = getRouteKey(req.method, req.path);
  const action = ACTION_MAP[routeKey];

  if (action && req.user) {
    let entityId = null;
    if (req.params.id) entityId = parseInt(req.params.id);
    else if (req.params.medicineId) entityId = parseInt(req.params.medicineId);

    const detailsMap = {
      "USER_STATUS_CHANGE": { status: req.body?.status },
      "USER_PASSWORD_RESET": { targetUserId: req.body?.userId },
      "ORDER_CREATE": { orderId: res.locals.orderId },
      "PRESCRIPTION_CREATE": { prescriptionId: res.locals.prescriptionId },
      "MEDICINE_CREATE": { name: req.body?.name },
      "MEDICINE_UPDATE": { changes: req.body },
      "INVENTORY_ADD": { batchNumber: req.body?.batchNumber, quantity: req.body?.quantity }
    };

    const details = detailsMap[action] || {};

    res.on("finish", async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await auditService.log(
          action,
          action.split("_")[0],
          entityId,
          details,
          req.user
        );
      }
    });
  }

  next();
};