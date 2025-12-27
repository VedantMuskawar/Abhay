import * as functions from 'firebase-functions';
import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

const DELIVERY_MEMOS_COLLECTION = 'DELIVERY_MEMOS';
const SCHEDULE_TRIPS_COLLECTION = 'SCHEDULE_TRIPS';

/**
 * On trip status change to "returned", update the existing Delivery Memo document.
 * 
 * Flow:
 * 1. Find existing DM document by tripId
 * 2. Add return-related fields (returnedAt, meters, etc.)
 * 3. If payment type is 'pay_on_delivery', add payment details array
 * Note: DM status is NOT changed - it remains as is (typically 'active')
 */
export const onTripReturnedCreateDM = functions.firestore
  .document(`${SCHEDULE_TRIPS_COLLECTION}/{tripId}`)
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const tripId = context.params.tripId as string;

    if (!before || !after) return;

    // Only act on status change to returned
    if ((before.tripStatus || before.orderStatus) === 'returned') return;
    const afterStatus = (after.tripStatus || after.orderStatus || '').toLowerCase();
    if (afterStatus !== 'returned') return;

    const organizationId = after.organizationId as string | undefined;
    if (!organizationId) {
      console.warn('[Trip Return DM] Missing organizationId, skipping', {tripId});
      return;
    }

    // Find existing DM document
    const dmQuery = await db
      .collection(DELIVERY_MEMOS_COLLECTION)
      .where('tripId', '==', tripId)
      .limit(1)
      .get();

    if (dmQuery.empty) {
      console.warn('[Trip Return DM] No DM document found for trip', {tripId});
      return;
    }

    const dmDoc = dmQuery.docs[0];
    const paymentType = (after.paymentType as string)?.toLowerCase() || '';

    // Prepare update data
    // Note: Do NOT change DM status - keep it as is (typically 'active')
    const updateData: any = {
      tripStatus: after.tripStatus || 'returned',
      orderStatus: after.orderStatus || '',
      returnedAt: after.returnedAt || new Date(),
      returnedBy: after.returnedBy || null,
      returnedByRole: after.returnedByRole || null,
      meters: {
        initialReading: after.initialReading ?? null,
        finalReading: after.finalReading ?? null,
        distanceTravelled: after.distanceTravelled ?? null,
      },
      updatedAt: new Date(),
    };

    // If Pay on Delivery, add mode of payment array
    if (paymentType === 'pay_on_delivery') {
      const paymentDetails = after.paymentDetails || [];
      updateData.paymentDetails = paymentDetails;
      updateData.paymentStatus = after.paymentStatus || 'pending';
      updateData.totalPaidOnReturn = after.totalPaidOnReturn ?? null;
      updateData.remainingAmount = after.remainingAmount ?? null;
    }

    // Update delivery memo document
    await dmDoc.ref.update(updateData);

    console.log('[Trip Return DM] DM updated on return', {
      tripId,
      dmId: dmDoc.id,
      paymentType,
      hasPaymentDetails: paymentType === 'pay_on_delivery' && !!updateData.paymentDetails,
    });
  });


