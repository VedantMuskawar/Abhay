# Order and Trip Flow - Test Checklist

## Prerequisites
- [ ] Firebase Functions deployed (`cd functions && npm run deploy`)
- [ ] Android app built and ready for testing
- [ ] Web app built and ready for testing
- [ ] Test organization created
- [ ] Test client created
- [ ] Test products created
- [ ] Test vehicles created
- [ ] Delivery zones configured
- [ ] Payment accounts configured

---

## 1. Order Creation Tests

### 1.1 Basic Order Creation
- [ ] Create order with single product
- [ ] Create order with multiple products
- [ ] Verify order document created in `PENDING_ORDERS`
- [ ] Verify order status is `pending`
- [ ] Verify `scheduledTrips` array is empty
- [ ] Verify `totalScheduledTrips` is 0
- [ ] Verify order number is generated (check Cloud Function logs)

### 1.2 Order with Advance Payment
- [ ] Create order with advance payment (amount < total)
- [ ] Verify advance payment transaction created (`type: 'advance'`)
- [ ] Verify transaction status is `completed`
- [ ] Verify transaction description: "Advance payment for order {orderNumber}"
- [ ] Verify client ledger updated (balance decreased)
- [ ] Verify transaction analytics updated
- [ ] Create order with advance payment = total amount
- [ ] Verify advance payment transaction created correctly

### 1.3 Order Creation Validation
- [ ] Try creating order with invalid client (should fail)
- [ ] Try creating order with invalid delivery zone (should fail)
- [ ] Try creating order with advance amount > total (should fail gracefully)
- [ ] Try creating order with invalid payment account (should fail gracefully)

### 1.4 Order Creation Edge Cases
- [ ] Create order without advance payment (verify no transaction created)
- [ ] Create order with zone price updates (verify atomic batch)
- [ ] Create order with new zone creation (verify atomic batch)
- [ ] Verify order creation fails if batch commit fails

---

## 2. Trip Scheduling Tests

### 2.1 Basic Trip Scheduling
- [ ] Schedule trip for pending order
- [ ] Verify trip document created in `SCHEDULE_TRIPS`
- [ ] Verify order's `scheduledTrips` array updated
- [ ] Verify `totalScheduledTrips` incremented
- [ ] Verify `estimatedTrips` decremented in order items
- [ ] Verify order status remains `pending` if trips remain
- [ ] Verify order status changes to `fully_scheduled` when all trips scheduled

### 2.2 Slot Availability
- [ ] Try scheduling trip with conflicting slot (same date + vehicle + slot)
- [ ] Verify conflict is detected and trip creation fails
- [ ] Verify existing trip is not affected

### 2.3 Trip Scheduling Edge Cases
- [ ] Schedule trip when order already fully scheduled (should fail or delete trip)
- [ ] Schedule trip when order has no items (should fail or delete trip)
- [ ] Schedule trip and delete order before Cloud Function runs (trip should be deleted)
- [ ] Verify trip pricing calculated correctly
- [ ] Verify `scheduleTripId` format: `{clientId}-{orderId}-{YYYYMMDD}-{vehicleId}-{slot}`

---

## 3. DM Generation Tests

### 3.1 DM Generation
- [ ] Generate DM for scheduled trip
- [ ] Verify DM number generated (sequential, per financial year)
- [ ] Verify trip document updated with `dmNumber` and `dmId`
- [ ] Verify FY document (`ORGANIZATIONS/{orgId}/DM/{FYXXYY}`) updated
- [ ] Verify DM number format: `DM/{financialYear}/{dmNumber}`

### 3.2 Credit Transaction on DM Generation
- [ ] Generate DM for pay_later trip
- [ ] Verify credit transaction created (`type: 'credit'`, category: 'income')
- [ ] Verify transaction description: "Order Credit - DM-{dmNumber} (Pay Later)"
- [ ] Verify transaction metadata includes: `tripId`, `dmNumber`, `paymentType`, `tripTotal`
- [ ] Verify `creditTransactionId` stored in trip document
- [ ] Verify client ledger updated (balance increased)
- [ ] Verify DM number stored in ledger `dmNumbers` array
- [ ] Generate DM for pay_on_delivery trip
- [ ] Verify credit transaction created with description: "Order Credit - DM-{dmNumber} (Pay on Delivery)"
- [ ] Verify transaction created for BOTH payment types

### 3.3 DM Cancellation
- [ ] Cancel DM before dispatch
- [ ] Verify DM marked as cancelled in `DELIVERY_MEMOS` (if DM doc exists)
- [ ] Verify `dmNumber` removed from trip document
- [ ] Verify credit transaction cancelled (if created)
- [ ] Verify ledger reversed (if credit transaction existed)
- [ ] Verify DM can be regenerated after cancellation

---

## 4. Trip Dispatch Tests

### 4.1 Basic Dispatch
- [ ] Dispatch trip with DM generated
- [ ] Verify trip status changes to `dispatched`
- [ ] Verify order's `scheduledTrips` array updated with dispatch fields
- [ ] Verify dispatch fields: `initialReading`, `dispatchedAt`, `dispatchedBy`, `dispatchedByRole`
- [ ] Verify DM status remains `active` (not updated to dispatched)

### 4.2 Dispatch Validation
- [ ] Try dispatching trip without DM (should fail - status reverted)
- [ ] Verify Cloud Function reverts status if DM missing
- [ ] Verify error logged in Cloud Function logs

### 4.3 Dispatch Edge Cases
- [ ] Dispatch trip when order deleted (trip should continue independently)
- [ ] Verify trip can be dispatched even if order is cancelled
- [ ] Verify DM document exists but status not changed on dispatch

---

## 5. Trip Delivery Tests

### 5.1 Basic Delivery
- [ ] Mark dispatched trip as delivered
- [ ] Verify trip status changes to `delivered`
- [ ] Verify delivery fields: `deliveryPhotoUrl`, `deliveredAt`, `deliveredBy`, `deliveredByRole`
- [ ] Verify order's `scheduledTrips` array updated
- [ ] Verify DM status updated to `delivered`
- [ ] Verify delivery fields in DM document

### 5.2 Delivery Edge Cases
- [ ] Mark trip as delivered when order deleted (should work independently)
- [ ] Verify DM update succeeds even if order missing
- [ ] Mark trip as delivered without DM (should work, DM update skipped)

---

## 6. Trip Return Tests

### 6.1 Basic Return (Pay Later)
- [ ] Mark delivered trip as returned (pay_later)
- [ ] Verify trip status changes to `returned`
- [ ] Verify return fields: `finalReading`, `returnedAt`, `returnedBy`, `returnedByRole`
- [ ] Verify order's `scheduledTrips` array updated
- [ ] Verify NO debit transactions created (pay_later)
- [ ] Verify return DM created (via `onTripReturnedCreateDM`)
- [ ] Verify return DM has status `returned`

### 6.2 Return with Payment (Pay On Delivery)
- [ ] Mark delivered trip as returned (pay_on_delivery)
- [ ] Add payment(s) when marking as returned
- [ ] Verify debit transaction(s) created (`type: 'debit'`, category: 'income')
- [ ] Verify transaction description: "Trip Payment - DM-{dmNumber}"
- [ ] Verify transaction metadata includes: `tripId`, `dmNumber`, `paymentAccountId`
- [ ] Verify `returnTransactionIds` array stored in trip document
- [ ] Verify client ledger updated (balance decreased for each debit)
- [ ] Verify DM number stored in ledger `dmNumbers` array for each debit transaction
- [ ] Verify return DM created with payment details
- [ ] Test multiple payments split across accounts

### 6.3 Return Edge Cases
- [ ] Try marking trip as returned without being delivered (should validate or prevent)
- [ ] Mark trip as returned when order deleted (should work independently)
- [ ] Verify credit transaction (from dispatch) NOT cancelled on return
- [ ] Verify net balance: Order Credit - Trip Payment = Outstanding

---

## 7. Order Deletion Tests

### 7.1 Order Deletion - No Trips
- [ ] Delete order with no trips
- [ ] Verify ALL transactions deleted (including advance payment)
- [ ] Verify transactions trigger `onTransactionDeleted`
- [ ] Verify ledger reversed for all deleted transactions
- [ ] Verify analytics reversed

### 7.2 Order Deletion - With Active Trips
- [ ] Delete order with scheduled trip
- [ ] Verify advance payment transaction PRESERVED
- [ ] Verify credit transaction (if dispatched) PRESERVED
- [ ] Verify trip marked with `orderDeleted: true`
- [ ] Verify trips NOT deleted (remain independent)
- [ ] Delete order with dispatched trip
- [ ] Verify advance payment transaction PRESERVED
- [ ] Verify credit transaction PRESERVED
- [ ] Delete order with delivered trip
- [ ] Verify all transactions PRESERVED (advance + credit)
- [ ] Delete order with returned trip
- [ ] Verify all transactions PRESERVED (advance + credit + debits if pay_on_delivery)

### 7.3 Order Deletion - All Trips Cancelled
- [ ] Create order with advance payment
- [ ] Schedule trip, then cancel trip
- [ ] Delete order
- [ ] Verify advance payment transaction DELETED (no active trips)

### 7.4 Order Deletion Edge Cases
- [ ] Delete order with transaction deletion failure (should mark for cleanup)
- [ ] Verify DM documents NEVER deleted (check `DELIVERY_MEMOS` collection)
- [ ] Verify trip marking continues even if some fail

---

## 8. Trip Deletion/Cancellation Tests

### 8.1 Trip Cancellation - Before DM
- [ ] Cancel trip before DM generation
- [ ] Verify trip document deleted
- [ ] Verify order updated (trip removed from `scheduledTrips`, `estimatedTrips` incremented)
- [ ] Verify NO transaction cleanup needed

### 8.2 Trip Cancellation - After DM, Before Dispatch
- [ ] Generate DM for trip (credit transaction created)
- [ ] Cancel trip
- [ ] Verify credit transaction CANCELLED (status: 'cancelled')
- [ ] Verify ledger reversed (balance decreased)
- [ ] Verify DM document PRESERVED (status may be cancelled or active)
- [ ] Verify order updated

### 8.3 Trip Cancellation - After Dispatch
- [ ] Dispatch trip (DM generated, credit created)
- [ ] Cancel trip
- [ ] Verify credit transaction CANCELLED
- [ ] Verify ledger reversed
- [ ] Verify DM PRESERVED (never deleted)
- [ ] Verify order updated

### 8.4 Trip Cancellation - After Delivery
- [ ] Deliver trip
- [ ] Cancel trip
- [ ] Verify credit transaction CANCELLED
- [ ] Verify DM PRESERVED
- [ ] Verify order updated

### 8.5 Trip Cancellation - After Return
- [ ] Return trip (pay_on_delivery, with payments)
- [ ] Cancel trip
- [ ] Verify credit transaction CANCELLED
- [ ] Verify debit transactions CANCELLED (if pay_on_delivery)
- [ ] Verify all ledger effects reversed
- [ ] Verify DM PRESERVED
- [ ] Verify order updated

---

## 9. Status Reversal Tests

### 9.1 Dispatched → Scheduled
- [ ] Dispatch trip
- [ ] Revert trip status to `scheduled`
- [ ] Verify dispatch fields removed from trip
- [ ] Verify order's `scheduledTrips` updated
- [ ] Verify credit transaction CANCELLED
- [ ] Verify ledger reversed (balance decreased)
- [ ] Verify DM status remains `active` (not changed)

### 9.2 Delivered → Dispatched
- [ ] Deliver trip
- [ ] Revert trip status to `dispatched`
- [ ] Verify delivery fields removed from trip
- [ ] Verify order's `scheduledTrips` updated
- [ ] Verify DM status reverted to `active`
- [ ] Verify delivery fields removed from DM
- [ ] Verify credit transaction remains (not cancelled)

### 9.3 Returned → Delivered
- [ ] Return trip (pay_on_delivery, with payments)
- [ ] Revert trip status to `delivered`
- [ ] Verify return fields removed from trip
- [ ] Verify order's `scheduledTrips` updated
- [ ] Verify return DM status reverted to `delivered`
- [ ] Verify debit transactions CANCELLED
- [ ] Verify ledger reversed (balance increased for each debit)
- [ ] Verify credit transaction remains (not cancelled)

---

## 10. Transaction and Ledger Tests

### 10.1 Transaction Creation
- [ ] Verify all transaction types create correct ledger entries
- [ ] Verify `advance`: decreases balance (-amount)
- [ ] Verify `credit`: increases balance (+amount)
- [ ] Verify `debit`: decreases balance (-amount)
- [ ] Verify balance calculation: `balanceAfter = balanceBefore + ledgerDelta`

### 10.2 DM Number Storage in Ledger
- [ ] Verify Order Credit transaction stores DM number in ledger `dmNumbers` array
- [ ] Verify Trip Payment (debit) transaction stores DM number in ledger `dmNumbers` array
- [ ] Verify Advance Payment transaction does NOT store DM number
- [ ] Verify multiple transactions with same DM number handled correctly

### 10.3 Transaction Analytics
- [ ] Verify transaction counts updated correctly
- [ ] Verify income totals updated correctly
- [ ] Verify net income calculated correctly
- [ ] Verify analytics updated per financial year

---

## 11. Integration Tests

### 11.1 Complete Flow - Pay Later
- [ ] Create order with advance payment
- [ ] Schedule trip
- [ ] Generate DM (credit transaction created)
- [ ] Dispatch trip
- [ ] Deliver trip
- [ ] Return trip (no debit transactions)
- [ ] Verify final ledger balance: Advance - Order Credit = Net
- [ ] Verify all transactions present and correct

### 11.2 Complete Flow - Pay On Delivery
- [ ] Create order with advance payment
- [ ] Schedule trip
- [ ] Generate DM (credit transaction created)
- [ ] Dispatch trip
- [ ] Deliver trip
- [ ] Return trip with payment (debit transaction(s) created)
- [ ] Verify final ledger balance: Advance - Order Credit + Trip Payment = Net
- [ ] Verify all transactions present and correct

### 11.3 Order Deletion in Middle of Flow
- [ ] Create order with advance payment
- [ ] Schedule trip
- [ ] Generate DM
- [ ] Dispatch trip
- [ ] Delete order
- [ ] Verify advance payment PRESERVED
- [ ] Verify credit transaction PRESERVED
- [ ] Verify trip continues independently
- [ ] Complete trip (deliver, return)
- [ ] Verify trip can complete without order

---

## 12. Edge Cases and Error Handling

### 12.1 Concurrent Operations
- [ ] Try scheduling multiple trips for same slot simultaneously
- [ ] Try deleting order while trip being scheduled
- [ ] Try dispatching trip while order being deleted

### 12.2 Data Consistency
- [ ] Verify no orphaned trips after order deletion
- [ ] Verify no orphaned transactions after trip cancellation
- [ ] Verify ledger balance matches sum of all transactions
- [ ] Verify DM documents always preserved

### 12.3 Error Scenarios
- [ ] Test transaction creation failure (should mark order with error flags)
- [ ] Test Cloud Function failures (should not leave inconsistent state)
- [ ] Test network failures during batch operations
- [ ] Verify retry logic works correctly

---

## 13. Web App Specific Tests

### 13.1 Trip Scheduling (Web)
- [ ] Schedule trip via Web app
- [ ] Verify trip created correctly
- [ ] Verify order updated correctly

### 13.2 DM Generation (Web)
- [ ] Generate DM via Web app
- [ ] Verify DM generated correctly
- [ ] Verify credit transaction created
- [ ] Cancel DM via Web app
- [ ] Verify DM cancellation works

### 13.3 UI Restrictions
- [ ] Verify "Generate DM" only visible for scheduled trips without DM
- [ ] Verify "Cancel DM" only visible for scheduled trips with DM
- [ ] Verify dispatched trips show "View DM" only

---

## 14. Android App Specific Tests

### 14.1 Complete Flow (Android)
- [ ] Create order via Android app
- [ ] Schedule trip via Android app
- [ ] Generate DM (should call cloud function)
- [ ] Dispatch trip
- [ ] Deliver trip
- [ ] Return trip with payments (pay_on_delivery)
- [ ] Verify all transactions created correctly
- [ ] Verify all updates reflected in Firestore

### 14.2 Payment Handling
- [ ] Test single payment on return
- [ ] Test multiple payments on return
- [ ] Verify debit transactions created with correct descriptions
- [ ] Verify DM numbers stored correctly

---

## 15. Validation Tests

### 15.1 Transaction Descriptions
- [ ] Verify advance payment description: "Advance payment for order {orderNumber}"
- [ ] Verify Order Credit description: "Order Credit - DM-{dmNumber} (Pay Later)" or "(Pay on Delivery)"
- [ ] Verify Trip Payment description: "Trip Payment - DM-{dmNumber}"

### 15.2 Transaction Metadata
- [ ] Verify all transactions have required metadata
- [ ] Verify `orderId` present in all order-related transactions
- [ ] Verify `tripId` present in trip-related transactions
- [ ] Verify `dmNumber` present in credit and debit transactions

### 15.3 Financial Year Handling
- [ ] Test orders/trips across financial year boundaries
- [ ] Verify transactions stored in correct FY
- [ ] Verify ledger balances per FY
- [ ] Verify DM numbering per FY

---

## Notes

1. **DM Preservation**: All DM documents should NEVER be deleted, regardless of trip/order status
2. **Advance Payment Preservation**: Advance payments preserved when active trips exist (scheduled, dispatched, delivered, returned)
3. **Transaction Types**: Verify correct transaction types used (`advance`, `credit`, `debit`)
4. **Ledger Consistency**: Always verify ledger balances match expected values
5. **Cloud Function Logs**: Check Firebase Functions logs for errors and validation messages

---

## Sign-off

- [ ] All tests passed
- [ ] No data inconsistencies found
- [ ] All edge cases handled correctly
- [ ] Cloud Functions logs reviewed
- [ ] Ready for production

**Tested By**: _________________  
**Date**: _________________  
**Notes**: _________________

