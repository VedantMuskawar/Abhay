# Cleanup Test Data Function

This function allows you to clean up all test data and reset DM counters to start fresh.

## What it deletes:

- ✅ All Pending Orders
- ✅ All Scheduled Trips  
- ✅ All Transactions
- ✅ All Client Ledger entries
- ✅ All Transaction Analytics entries
- ✅ All Delivery Memos
- ✅ Resets all DM counters in Organizations to start from DM 1

## ⚠️ WARNING: This is IRREVERSIBLE!

Only use this on test/staging data. All deletions are permanent.

## How to Use:

### Option 1: Call from Flutter App (Recommended for testing)

Add this code to your Flutter app (e.g., in a debug menu or admin panel):

```dart
import 'package:cloud_functions/cloud_functions.dart';

Future<void> cleanupTestData() async {
  try {
    final callable = FirebaseFunctions.instance.httpsCallable('cleanupTestData');
    final result = await callable.call();
    
    print('Cleanup completed!');
    print('Results: ${result.data}');
  } catch (e) {
    print('Error: $e');
  }
}
```

### Option 2: Using Firebase Console

1. Go to Firebase Console → Functions
2. Find `cleanupTestData` function
3. Click "Test" or use the function URL with a POST request

### Option 3: Using Firebase CLI

```bash
# Make sure you're logged in
firebase login

# Deploy the function first (if not already deployed)
cd functions
npm run deploy

# Then call it using curl or HTTP client
curl -X POST \
  https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/cleanupTestData \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(firebase login:ci --no-localhost)" \
  -d '{}'
```

### Option 4: Using Node.js Script

1. Make sure you have Firebase Admin SDK credentials
2. Run: `node scripts/cleanup-test-data.js`

## Response Format:

```json
{
  "success": true,
  "message": "Test data cleanup completed",
  "results": {
    "pendingOrdersDeleted": 10,
    "scheduledTripsDeleted": 5,
    "transactionsDeleted": 15,
    "clientLedgersDeleted": 8,
    "transactionAnalyticsDeleted": 12,
    "deliveryMemosDeleted": 3,
    "dmCountersReset": 2,
    "errors": []
  }
}
```

## Deployment:

The function is automatically exported from `functions/src/index.ts`. After making changes, deploy with:

```bash
cd functions
npm run deploy
```

Or deploy all functions:
```bash
firebase deploy --only functions
```

