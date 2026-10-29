/**
 * Portal-scoped auth storage so B2C, Partner, Corporate, Worker, and Delivery
 * can stay logged in at the same time without overwriting each other's IDs.
 */

function createPortalSession(prefix, fields) {
  const key = (field) => `${prefix}${field}`;

  return {
    get(field) {
      return localStorage.getItem(key(field));
    },
    set(field, value) {
      if (value == null) localStorage.removeItem(key(field));
      else localStorage.setItem(key(field), value);
    },
    setAuth(data) {
      fields.forEach((field) => {
        const value = data[field];
        if (value != null && value !== '') this.set(field, value);
      });
    },
    clear() {
      fields.forEach((field) => localStorage.removeItem(key(field)));
    },
    isLoggedIn() {
      const idField = fields[0];
      return !!localStorage.getItem(key(idField));
    },
  };
}

export const customerSession = createPortalSession('fixswap:customer:', [
  'userId',
  'userName',
  'userRole',
  'userEmail',
]);

export const partnerSession = createPortalSession('fixswap:partner:', [
  'userId',
  'userName',
  'role',
  'shopId',
]);

export const corporateSession = createPortalSession('fixswap:corporate:', [
  'userId',
  'userName',
  'userRole',
  'userEmail',
]);

export const workerSession = createPortalSession('fixswap:worker:', [
  'workerId',
  'workerName',
  'shopId',
]);

export const deliverySession = createPortalSession('fixswap:delivery:', [
  'workerId',
  'workerName',
  'workerType',
]);

/** Remove legacy shared keys that caused cross-portal session bleed. */
export function clearLegacySharedAuth() {
  ['userId', 'userName', 'userRole', 'userEmail', 'role', 'shopId', 'workerId', 'workerName', 'workerType'].forEach(
    (k) => localStorage.removeItem(k)
  );
}
