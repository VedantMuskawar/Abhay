"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupTestData = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const admin = __importStar(require("firebase-admin"));
const db = (0, firestore_1.getFirestore)();
const PENDING_ORDERS_COLLECTION = 'PENDING_ORDERS';
const SCHEDULE_TRIPS_COLLECTION = 'SCHEDULE_TRIPS';
const TRANSACTIONS_COLLECTION = 'TRANSACTIONS';
const CLIENT_LEDGERS_COLLECTION = 'CLIENT_LEDGERS';
const TRANSACTION_ANALYTICS_COLLECTION = 'TRANSACTION_ANALYTICS';
const DELIVERY_MEMOS_COLLECTION = 'DELIVERY_MEMOS';
const ORGANIZATIONS_COLLECTION = 'ORGANIZATIONS';
/**
 * Cleanup script to remove all test data and reset DM counters
 *
 * WARNING: This will delete:
 * - All pending orders
 * - All scheduled trips
 * - All transactions
 * - All client ledger entries
 * - All transaction analytics entries
 * - All delivery memos
 * - Reset DM counters in Organizations to start from 1
 *
 * Use with caution! This is irreversible.
 */
exports.cleanupTestData = (0, https_1.onCall)(async (request) => {
    // Optional: Add authentication/authorization check here
    // const auth = request.auth;
    // if (!auth || auth.token.role !== 'admin') {
    //   throw new Error('Unauthorized');
    // }
    console.log('[Cleanup] Starting test data cleanup...');
    try {
        const results = {
            pendingOrdersDeleted: 0,
            scheduledTripsDeleted: 0,
            transactionsDeleted: 0,
            clientLedgersDeleted: 0,
            transactionAnalyticsDeleted: 0,
            deliveryMemosDeleted: 0,
            dmCountersReset: 0,
            errors: [],
        };
        // Helper function to delete documents in batches (Firestore batch limit is 500)
        const deleteInBatches = async (collectionName) => {
            const collectionRef = db.collection(collectionName);
            let totalDeleted = 0;
            const maxIterations = 1000; // Safety limit to prevent infinite loops
            let iteration = 0;
            while (iteration < maxIterations) {
                const snapshot = await collectionRef.limit(500).get();
                if (snapshot.empty) {
                    break;
                }
                const batch = db.batch();
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                totalDeleted += snapshot.size;
                console.log(`[Cleanup] Deleted batch of ${snapshot.size} documents from ${collectionName} (total: ${totalDeleted})`);
                iteration++;
                // If we got fewer than 500 documents, we're done
                if (snapshot.size < 500) {
                    break;
                }
            }
            if (iteration >= maxIterations) {
                console.warn(`[Cleanup] Reached max iterations for ${collectionName}, may not have deleted all documents`);
            }
            return totalDeleted;
        };
        // Step 1: Delete all Delivery Memos
        console.log('[Cleanup] Deleting delivery memos...');
        try {
            results.deliveryMemosDeleted = await deleteInBatches(DELIVERY_MEMOS_COLLECTION);
            console.log(`[Cleanup] Deleted ${results.deliveryMemosDeleted} delivery memos`);
        }
        catch (error) {
            const errorMsg = `Failed to delete delivery memos: ${error.message}`;
            console.error(`[Cleanup] ${errorMsg}`, error);
            results.errors.push(errorMsg);
        }
        // Step 2: Delete all Scheduled Trips
        console.log('[Cleanup] Deleting scheduled trips...');
        try {
            results.scheduledTripsDeleted = await deleteInBatches(SCHEDULE_TRIPS_COLLECTION);
            console.log(`[Cleanup] Deleted ${results.scheduledTripsDeleted} scheduled trips`);
        }
        catch (error) {
            const errorMsg = `Failed to delete scheduled trips: ${error.message}`;
            console.error(`[Cleanup] ${errorMsg}`, error);
            results.errors.push(errorMsg);
        }
        // Step 3: Delete all Pending Orders
        console.log('[Cleanup] Deleting pending orders...');
        try {
            results.pendingOrdersDeleted = await deleteInBatches(PENDING_ORDERS_COLLECTION);
            console.log(`[Cleanup] Deleted ${results.pendingOrdersDeleted} pending orders`);
        }
        catch (error) {
            const errorMsg = `Failed to delete pending orders: ${error.message}`;
            console.error(`[Cleanup] ${errorMsg}`, error);
            results.errors.push(errorMsg);
        }
        // Step 4: Delete all Transactions
        console.log('[Cleanup] Deleting transactions...');
        try {
            results.transactionsDeleted = await deleteInBatches(TRANSACTIONS_COLLECTION);
            console.log(`[Cleanup] Deleted ${results.transactionsDeleted} transactions`);
        }
        catch (error) {
            const errorMsg = `Failed to delete transactions: ${error.message}`;
            console.error(`[Cleanup] ${errorMsg}`, error);
            results.errors.push(errorMsg);
        }
        // Step 5: Delete all Client Ledgers
        console.log('[Cleanup] Deleting client ledgers...');
        try {
            results.clientLedgersDeleted = await deleteInBatches(CLIENT_LEDGERS_COLLECTION);
            console.log(`[Cleanup] Deleted ${results.clientLedgersDeleted} client ledgers`);
        }
        catch (error) {
            const errorMsg = `Failed to delete client ledgers: ${error.message}`;
            console.error(`[Cleanup] ${errorMsg}`, error);
            results.errors.push(errorMsg);
        }
        // Step 6: Delete all Transaction Analytics
        console.log('[Cleanup] Deleting transaction analytics...');
        try {
            results.transactionAnalyticsDeleted = await deleteInBatches(TRANSACTION_ANALYTICS_COLLECTION);
            console.log(`[Cleanup] Deleted ${results.transactionAnalyticsDeleted} transaction analytics entries`);
        }
        catch (error) {
            const errorMsg = `Failed to delete transaction analytics: ${error.message}`;
            console.error(`[Cleanup] ${errorMsg}`, error);
            results.errors.push(errorMsg);
        }
        // Step 7: Reset DM counters in all Organizations
        console.log('[Cleanup] Resetting DM counters in organizations...');
        try {
            const orgsSnapshot = await db.collection(ORGANIZATIONS_COLLECTION).get();
            const resetPromises = orgsSnapshot.docs.map(async (orgDoc) => {
                const orgId = orgDoc.id;
                const dmCollectionRef = orgDoc.ref.collection('DM');
                const dmDocsSnapshot = await dmCollectionRef.get();
                // Reset all DM counter documents to start from 1
                const dmResetPromises = dmDocsSnapshot.docs.map(async (dmDoc) => {
                    const financialYear = dmDoc.id;
                    // Reset currentDMNumber to 0 (so next DM will be 1)
                    await dmDoc.ref.update({
                        currentDMNumber: 0,
                        startDMNumber: 1,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    console.log(`[Cleanup] Reset DM counter for ${orgId}/DM/${financialYear}`);
                });
                await Promise.all(dmResetPromises);
                return dmDocsSnapshot.size;
            });
            const dmCounts = await Promise.all(resetPromises);
            results.dmCountersReset = dmCounts.reduce((sum, count) => sum + count, 0);
            console.log(`[Cleanup] Reset ${results.dmCountersReset} DM counter documents`);
        }
        catch (error) {
            const errorMsg = `Failed to reset DM counters: ${error.message}`;
            console.error(`[Cleanup] ${errorMsg}`, error);
            results.errors.push(errorMsg);
        }
        console.log('[Cleanup] Cleanup completed', results);
        return {
            success: true,
            message: 'Test data cleanup completed',
            results,
        };
    }
    catch (error) {
        console.error('[Cleanup] Fatal error during cleanup', error);
        throw new Error(`Cleanup failed: ${error.message}`);
    }
});
//# sourceMappingURL=cleanup-test-data.js.map