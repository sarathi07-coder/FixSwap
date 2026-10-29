/** Customer-facing progress tracker for in-house vs delivery-partner rescues */

export const INHOUSE_TRACKER_STEPS = [
  { keys: ['PENDING', 'ACCEPTED'], label: 'Shop Assigned' },
  { keys: ['TECH_DISPATCHED'], label: 'Tech En Route' },
  { keys: ['ITEM_COLLECTED', 'LOANER_GIVEN', 'DEVICE_SWAPPED'], label: 'Pickup & Loaner' },
  { keys: ['IN_REPAIR', 'REPAIR_DONE', 'DROPPED_AT_HUB'], label: 'In Repair' },
  { keys: ['RETURNING'], label: 'Return Transit' },
  { keys: ['COMPLETED'], label: 'Resolved' },
];

/** Hub-first delivery: partner hub → customer swap → hub drop → repair → return courier */
export const DELIVERY_TRACKER_STEPS = [
  { keys: ['PENDING', 'ACCEPTED'], label: 'Shop Assigned' },
  { keys: ['TECH_DISPATCHED'], label: 'Courier at Hub' },
  { keys: ['LOANER_COLLECTED_AT_HUB'], label: 'Loaner to You' },
  { keys: ['EN_ROUTE_TO_CUSTOMER'], label: 'At Your Door' },
  { keys: ['LOANER_GIVEN', 'ITEM_COLLECTED', 'EN_ROUTE_TO_HUB_DROP'], label: 'Back to Hub' },
  { keys: ['DROPPED_AT_HUB', 'IN_REPAIR', 'REPAIR_DONE', 'AWAITING_RETURN_PICKUP'], label: 'Repairing' },
  { keys: ['RETURNING'], label: 'Return Courier' },
  { keys: ['REPAIRED_COLLECTED_AT_HUB'], label: 'Device Return' },
  { keys: ['COMPLETED'], label: 'Resolved' },
];

export function isDeliveryPartnerTicket(ticket) {
  return ticket?.fulfillmentType === 'DELIVERY_PARTNER';
}

export function getTrackerSteps(ticket) {
  return isDeliveryPartnerTicket(ticket) ? DELIVERY_TRACKER_STEPS : INHOUSE_TRACKER_STEPS;
}

export function getStepIndex(ticket) {
  const steps = getTrackerSteps(ticket);
  const status = ticket?.status;
  if (!status) return 0;
  const idx = steps.findIndex((s) => s.keys.includes(status));
  return idx >= 0 ? idx : 0;
}

export function getStatusBanner(ticket) {
  const shop = ticket?.shop?.shopName || 'Service Partner';
  const delivery = isDeliveryPartnerTicket(ticket);
  const s = ticket?.status;

  if (s === 'PENDING') {
    return {
      tone: 'pending',
      title: 'Broadcasting rescue request (8km radius)',
      subtitle: 'Waiting for a nearby partner shop to accept',
    };
  }
  if (s === 'ACCEPTED') {
    return {
      tone: 'active',
      title: delivery ? 'Partner accepted — assigning delivery courier' : 'Partner accepted your rescue',
      subtitle: `Accepted by: ${shop}`,
    };
  }

  if (delivery) {
    const map = {
      TECH_DISPATCHED: {
        title: 'Courier heading to partner hub',
        subtitle: 'Collecting your loaner device (hub OTP in progress)',
      },
      LOANER_COLLECTED_AT_HUB: {
        title: 'Loaner collected — courier en route to you',
        subtitle: 'You will receive OTP when they reach your doorstep',
      },
      EN_ROUTE_TO_CUSTOMER: {
        title: 'Courier arriving at your home',
        subtitle: 'Share your OTP and verify courier identity below',
      },
      LOANER_GIVEN: {
        title: 'Loaner delivered — broken device with courier',
        subtitle: 'Courier returning your device to the partner hub',
      },
      ITEM_COLLECTED: {
        title: 'Device collected — returning to partner hub',
        subtitle: 'Your appliance is being taken for repair',
      },
      EN_ROUTE_TO_HUB_DROP: {
        title: 'Courier returning device to partner hub',
        subtitle: 'Hub handover OTP in progress at the shop',
      },
      DROPPED_AT_HUB: {
        title: 'Device received at partner hub',
        subtitle: 'Technician will start the repair shortly',
      },
      IN_REPAIR: {
        title: 'Repair in progress at partner hub',
        subtitle: 'We will notify you when the repair is complete',
      },
      REPAIR_DONE: {
        title: 'Repair completed',
        subtitle: 'Waiting for a return delivery courier to be assigned',
      },
      AWAITING_RETURN_PICKUP: {
        title: 'Ready for return delivery',
        subtitle: 'A courier will collect the repaired device from the hub',
      },
      RETURNING: {
        title: 'Return courier at partner hub',
        subtitle: 'Collecting your repaired device (hub OTP in progress)',
      },
      REPAIRED_COLLECTED_AT_HUB: {
        title: 'Repaired device on the way back to you',
        subtitle: 'Share delivery OTP and verify courier when they arrive',
      },
      COMPLETED: {
        title: 'Rescue completed',
        subtitle: 'Loaner returned to hub — your device is back',
      },
    };
    if (map[s]) {
      return { tone: 'active', ...map[s] };
    }
  }

  const inHouseMap = {
    TECH_DISPATCHED: {
      title: 'Technician en route to you',
      subtitle: `Dispatched by: ${shop}`,
    },
    ITEM_COLLECTED: { title: 'Device collected', subtitle: 'Loaner handover in progress' },
    LOANER_GIVEN: { title: 'Loaner device with you', subtitle: 'Your appliance is at the repair hub' },
    IN_REPAIR: { title: 'Repair in progress', subtitle: `At: ${shop}` },
    REPAIR_DONE: { title: 'Repair completed', subtitle: 'Preparing return delivery' },
    RETURNING: {
      title: 'Technician returning with your device',
      subtitle: 'Share delivery OTP when they arrive',
    },
    COMPLETED: { title: 'Rescue completed', subtitle: 'Thank you for using FixSwap' },
  };
  if (inHouseMap[s]) {
    return { tone: 'active', ...inHouseMap[s] };
  }

  return {
    tone: 'active',
    title: 'Rescue in progress',
    subtitle: `Partner: ${shop}`,
  };
}

export function showsPickupOtpSection(ticket) {
  if (isDeliveryPartnerTicket(ticket)) {
    return ticket.status === 'EN_ROUTE_TO_CUSTOMER' && !!ticket.pickupOtp;
  }
  return ticket.status === 'TECH_DISPATCHED';
}

export function showsDeliveryOtpSection(ticket) {
  if (isDeliveryPartnerTicket(ticket)) {
    return ticket.status === 'REPAIRED_COLLECTED_AT_HUB' && !!ticket.deliveryOtp;
  }
  return ticket.status === 'RETURNING';
}
