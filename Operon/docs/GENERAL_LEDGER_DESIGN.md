# General Ledger System Design

## Overview

A comprehensive General Ledger system that tracks all financial transactions at the organization level, including Orders, Payments, and Expenses. Supports daily/period-based views, admin verification, and provides detailed analytics.

---

## Database Schema

### 1. General Ledger Entry (`GENERAL_LEDGER_ENTRIES`)

**Collection:** `GENERAL_LEDGER_ENTRIES`

**Document Structure:**
```typescript
{
  // Identity
  entryId: string;                    // Same as document ID
  entryNumber: string;                // Generated: "GL-{YYYYMMDD}-{NNN}" or "GL-{FY}-{NNN}"
  
  // Organization & Period
  organizationId: string;
  financialYear: string;              // "FY2425"
  entryDate: Timestamp;               // Date of the transaction (can be backdated)
  periodType: string;                 // "daily" | "period" | "manual"
  
  // Transaction Source
  sourceType: string;                 // "order" | "payment" | "expense" | "adjustment"
  sourceId: string;                   // Reference to source (orderId, transactionId, expenseId)
  sourceReference?: string;           // Human-readable reference (orderNumber, invoiceNumber, etc.)
  
  // Transaction Details
  category: string;                   // "income" | "expense"
  type: string;                        // For income: "order_sale", "payment_received", "advance"
                                       // For expense: "operational", "salary", "fuel", "maintenance", "other"
  
  // Amounts
  amount: number;                      // Positive for income, negative for expense
  currency: string;                   // Default: "INR"
  
  // Payment Information
  paymentMode: string;                 // "cash" | "upi" | "bank_transfer" | "cheque" | "credit" | "other"
  paymentAccountId?: string;           // Reference to PAYMENT_ACCOUNTS collection
  referenceNumber?: string;            // Payment reference (UTR, cheque number, etc.)
  
  // Client/Party Information (for income entries)
  clientId?: string;                  // Reference to CLIENTS collection
  clientName?: string;                 // Snapshot at entry time
  clientPhone?: string;                // Snapshot at entry time
  
  // Order Information (if source is order)
  orderId?: string;                   // Reference to PENDING_ORDERS
  orderNumber?: string;                // Snapshot
  
  // Expense Details (if source is expense)
  expenseCategory?: string;            // "operational" | "salary" | "fuel" | "maintenance" | "other"
  expenseDescription?: string;         // Detailed description
  vendorName?: string;                 // Vendor/supplier name
  vendorContact?: string;               // Vendor contact info
  
  // Verification & Status
  status: string;                      // "pending" | "verified" | "rejected" | "cancelled"
  verifiedBy?: string;                  // User ID who verified
  verifiedAt?: Timestamp;              // Verification timestamp
  rejectionReason?: string;            // If rejected
  cancelledBy?: string;                // User ID who cancelled
  cancelledAt?: Timestamp;             // Cancellation timestamp
  
  // Metadata
  description?: string;                 // Additional notes/description
  attachments?: string[];               // Array of storage URLs (receipts, invoices, etc.)
  tags?: string[];                      // For categorization/filtering
  metadata?: Map<string, dynamic>;     // Additional flexible data
  
  // Audit Trail
  createdBy: string;                   // User ID who created
  createdAt: Timestamp;                 // Entry creation timestamp
  updatedBy?: string;                   // User ID who last updated
  updatedAt: Timestamp;                 // Last update timestamp
  
  // Reconciliation
  reconciled: boolean;                 // Whether entry is reconciled
  reconciledBy?: string;                // User ID who reconciled
  reconciledAt?: Timestamp;            // Reconciliation timestamp
  reconciliationNotes?: string;        // Reconciliation notes
}
```

**Indexes Required:**
- `organizationId` + `entryDate` (descending)
- `organizationId` + `financialYear` + `status`
- `organizationId` + `sourceType` + `sourceId`
- `organizationId` + `category` + `entryDate`
- `organizationId` + `paymentMode` + `entryDate`
- `organizationId` + `status` + `entryDate`

---

### 2. General Ledger Summary (`GENERAL_LEDGER_SUMMARIES`)

**Collection:** `GENERAL_LEDGER_SUMMARIES`

**Purpose:** Pre-aggregated summaries for fast queries (daily, weekly, monthly, yearly)

**Document Structure:**
```typescript
{
  // Identity
  summaryId: string;                   // Format: "{orgId}_{periodType}_{periodKey}"
  organizationId: string;
  financialYear: string;
  
  // Period Information
  periodType: string;                  // "daily" | "weekly" | "monthly" | "yearly"
  periodKey: string;                   // "2024-04-01" (daily), "2024-W14" (weekly), "2024-04" (monthly), "FY2425" (yearly)
  periodStart: Timestamp;              // Period start date
  periodEnd: Timestamp;                // Period end date
  
  // Income Summary
  totalIncome: number;                  // Sum of all income entries
  incomeCount: number;                  // Number of income entries
  incomeByType: {                      // Breakdown by type
    order_sale: number;
    payment_received: number;
    advance: number;
    other: number;
  };
  
  // Expense Summary
  totalExpense: number;                 // Sum of all expense entries (positive value)
  expenseCount: number;                 // Number of expense entries
  expenseByCategory: {                 // Breakdown by category
    operational: number;
    salary: number;
    fuel: number;
    maintenance: number;
    other: number;
  };
  
  // Net Summary
  netIncome: number;                    // totalIncome - totalExpense
  netBalance: number;                   // Running balance (if applicable)
  
  // Payment Mode Distribution
  paymentModeDistribution: {           // Income distribution by payment mode
    cash: number;
    upi: number;
    bank_transfer: number;
    cheque: number;
    credit: number;
    other: number;
  };
  
  expensePaymentModeDistribution: {    // Expense distribution by payment mode
    cash: number;
    upi: number;
    bank_transfer: number;
    cheque: number;
    credit: number;
    other: number;
  };
  
  // Verification Status
  verifiedCount: number;                // Number of verified entries
  pendingCount: number;                 // Number of pending entries
  rejectedCount: number;                // Number of rejected entries
  
  // Client Summary (for income)
  uniqueClients: number;                // Number of unique clients
  topClients: Array<{                   // Top 5 clients by amount
    clientId: string;
    clientName: string;
    amount: number;
  }>;
  
  // Metadata
  lastUpdated: Timestamp;               // Last summary update
  entryIds: string[];                   // Array of entry IDs in this period (for reconciliation)
}
```

**Indexes Required:**
- `organizationId` + `periodType` + `periodKey`
- `organizationId` + `financialYear` + `periodType`
- `organizationId` + `periodStart` (descending)

---

### 3. Expense Categories Configuration (`EXPENSE_CATEGORIES`)

**Collection:** `ORGANIZATIONS/{orgId}/EXPENSE_CATEGORIES`

**Purpose:** Organization-specific expense categories

**Document Structure:**
```typescript
{
  categoryId: string;                  // Same as document ID
  name: string;                        // "Operational", "Salary", "Fuel", etc.
  description?: string;
  isActive: boolean;
  colorHex?: string;                   // For UI display
  iconName?: string;                   // For UI display
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## UI Design

### 1. General Ledger Dashboard Page

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  General Ledger Dashboard                                │
├─────────────────────────────────────────────────────────┤
│  [Period Selector] [Date Range] [Filters] [Export]     │
├─────────────────────────────────────────────────────────┤
│  Summary Cards:                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Total    │ │ Total    │ │ Net      │ │ Pending  │  │
│  │ Income   │ │ Expense  │ │ Income   │ │ Verify   │  │
│  │ ₹X,XXX   │ │ ₹X,XXX   │ │ ₹X,XXX   │ │ X entries│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  Charts:                                                │
│  ┌──────────────────────┐ ┌──────────────────────┐     │
│  │ Income vs Expense   │ │ Payment Mode         │     │
│  │ [Line Chart]        │ │ Distribution         │     │
│  │                     │ │ [Pie Chart]          │     │
│  └──────────────────────┘ └──────────────────────┘     │
├─────────────────────────────────────────────────────────┤
│  Recent Transactions Table:                            │
│  [Date] [Type] [Description] [Amount] [Status] [Actions]│
└─────────────────────────────────────────────────────────┘
```

**Components:**
- **Period Selector:** Dropdown (Today, This Week, This Month, This Year, Custom Range)
- **Summary Cards:** Total Income, Total Expense, Net Income, Pending Verification Count
- **Charts:**
  - Income vs Expense trend (Line chart)
  - Payment Mode Distribution (Pie chart)
  - Expense Category Distribution (Bar chart)
- **Transaction Table:** Sortable, filterable table with pagination

---

### 2. Add Entry Page

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Add General Ledger Entry                              │
├─────────────────────────────────────────────────────────┤
│  Entry Type: [Income ▼] [Expense ▼]                    │
│  Entry Date: [Date Picker]                             │
│                                                          │
│  ┌─ Income Form ───────────────────────────────────┐   │
│  │ Source: [Order ▼] [Payment ▼] [Manual ▼]      │   │
│  │ Order/Reference: [Search/Select]                │   │
│  │ Amount: ₹ [Input]                                │   │
│  │ Payment Mode: [Cash ▼] [UPI ▼] [Bank ▼]        │   │
│  │ Payment Account: [Select Account]                │   │
│  │ Reference Number: [Input]                        │   │
│  │ Description: [Text Area]                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Expense Form ───────────────────────────────────┐   │
│  │ Category: [Operational ▼] [Salary ▼] [Fuel ▼]  │   │
│  │ Amount: ₹ [Input]                                │   │
│  │ Payment Mode: [Cash ▼] [UPI ▼] [Bank ▼]         │   │
│  │ Payment Account: [Select Account]                 │   │
│  │ Vendor Name: [Input]                              │   │
│  │ Description: [Text Area]                         │   │
│  │ Attach Receipt: [Upload]                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Cancel] [Save as Draft] [Submit for Verification]    │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Auto-fill from Orders: When selecting an order, auto-fill amount, client info
- Receipt Upload: For expenses, allow image/document upload
- Draft Mode: Save entries as draft before submission
- Validation: Ensure all required fields are filled

---

### 3. Verification Page

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Pending Verifications                                  │
├─────────────────────────────────────────────────────────┤
│  Filters: [Date Range] [Type] [Amount Range]          │
├─────────────────────────────────────────────────────────┤
│  Entry Details:                                         │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Date: 2024-04-15                                │    │
│  │ Type: Expense | Category: Fuel                  │    │
│  │ Amount: ₹5,000                                  │    │
│  │ Payment Mode: UPI                                │    │
│  │ Description: Fuel for delivery vehicle          │    │
│  │ Receipt: [View]                                  │    │
│  │ Created By: John Doe                             │    │
│  │                                                  │    │
│  │ [Approve] [Reject] [Request More Info]          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  [Previous] Entry 1 of 15 [Next]                        │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Bulk Verification: Select multiple entries and verify at once
- Rejection Reasons: Dropdown of common reasons or custom text
- Request More Info: Send back to creator for additional details

---

### 4. Entry Detail/Edit Page

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  General Ledger Entry #GL-20240415-001                   │
├─────────────────────────────────────────────────────────┤
│  Status: [Verified ✓]                                   │
│  Entry Date: 2024-04-15                                 │
│                                                          │
│  Transaction Details:                                    │
│  • Type: Expense                                        │
│  • Category: Fuel                                       │
│  • Amount: ₹5,000                                       │
│  • Payment Mode: UPI                                    │
│  • Reference: UPI123456789                              │
│                                                          │
│  Verification:                                           │
│  • Verified By: Admin User                              │
│  • Verified At: 2024-04-15 14:30                        │
│                                                          │
│  [Edit] [Cancel Entry] [Export]                         │
└─────────────────────────────────────────────────────────┘
```

---

## Functions/Backend Logic

### 1. Cloud Functions

#### `onGeneralLedgerEntryCreated`
**Trigger:** `GENERAL_LEDGER_ENTRIES` document created

**Actions:**
1. Update `GENERAL_LEDGER_SUMMARIES` for the entry's period
2. If source is Order, link entry to order
3. If source is Transaction, link entry to transaction
4. Send notification to admins if entry requires verification
5. Update organization-level analytics

#### `onGeneralLedgerEntryUpdated`
**Trigger:** `GENERAL_LEDGER_ENTRIES` document updated

**Actions:**
1. Recalculate affected period summaries
2. If status changed to "verified", update verification counts
3. If amount changed, recalculate all affected summaries

#### `onGeneralLedgerEntryVerified`
**Trigger:** Status changed to "verified"

**Actions:**
1. Update summary verification counts
2. If entry is income, update client ledger (if applicable)
3. Update payment account balances
4. Trigger reconciliation checks

#### `onOrderStatusChanged`
**Trigger:** `PENDING_ORDERS` status changed to "delivered"

**Actions:**
1. Auto-create General Ledger entry for order sale
2. Set status to "pending" for admin verification
3. Link entry to order

#### `onTransactionCreated`
**Trigger:** `TRANSACTIONS` document created

**Actions:**
1. If transaction is payment/advance, create General Ledger entry
2. Link entry to transaction
3. Set status based on transaction status

---

### 2. Data Source Methods

#### `GeneralLedgerDataSource`

```dart
class GeneralLedgerDataSource {
  // Create entry
  Future<String> createEntry(Map<String, dynamic> entryData);
  
  // Get entry
  Future<Map<String, dynamic>?> getEntry(String entryId);
  
  // Update entry
  Future<void> updateEntry(String entryId, Map<String, dynamic> updates);
  
  // Verify entry
  Future<void> verifyEntry({
    required String entryId,
    required String verifiedBy,
    String? rejectionReason,
  });
  
  // Get entries for period
  Stream<List<Map<String, dynamic>>> watchEntries({
    required String organizationId,
    required DateTime startDate,
    required DateTime endDate,
    String? category,
    String? status,
    String? sourceType,
  });
  
  // Get summary for period
  Future<Map<String, dynamic>?> getSummary({
    required String organizationId,
    required String periodType,
    required String periodKey,
  });
  
  // Get payment mode distribution
  Future<Map<String, double>> getPaymentModeDistribution({
    required String organizationId,
    required DateTime startDate,
    required DateTime endDate,
    String? category, // "income" | "expense"
  });
  
  // Get expense category breakdown
  Future<Map<String, double>> getExpenseCategoryBreakdown({
    required String organizationId,
    required DateTime startDate,
    required DateTime endDate,
  });
  
  // Get net income trend
  Stream<List<Map<String, dynamic>>> watchNetIncomeTrend({
    required String organizationId,
    required DateTime startDate,
    required DateTime endDate,
    String periodType, // "daily" | "weekly" | "monthly"
  });
  
  // Get pending verifications count
  Future<int> getPendingVerificationsCount(String organizationId);
  
  // Bulk verify entries
  Future<void> bulkVerifyEntries({
    required String organizationId,
    required List<String> entryIds,
    required String verifiedBy,
  });
}
```

---

### 3. Repository Methods

#### `GeneralLedgerRepository`

```dart
class GeneralLedgerRepository {
  final GeneralLedgerDataSource _dataSource;
  
  // Entry CRUD
  Future<String> createEntry(GeneralLedgerEntry entry);
  Future<GeneralLedgerEntry?> getEntry(String entryId);
  Future<void> updateEntry(String entryId, GeneralLedgerEntry entry);
  Future<void> deleteEntry(String entryId);
  
  // Verification
  Future<void> verifyEntry(String entryId, String verifiedBy);
  Future<void> rejectEntry(String entryId, String rejectedBy, String reason);
  Future<void> bulkVerify(List<String> entryIds, String verifiedBy);
  
  // Queries
  Stream<List<GeneralLedgerEntry>> watchEntries({
    required String organizationId,
    required DateTime startDate,
    required DateTime endDate,
    GeneralLedgerFilter? filter,
  });
  
  // Analytics
  Future<GeneralLedgerSummary> getSummary({
    required String organizationId,
    required DateTime startDate,
    required DateTime endDate,
  });
  
  Future<PaymentModeDistribution> getPaymentModeDistribution({
    required String organizationId,
    required DateTime startDate,
    required DateTime endDate,
  });
  
  Future<int> getPendingVerificationsCount(String organizationId);
}
```

---

## Integration Points

### 1. Orders Integration
- When order is delivered → Auto-create income entry
- Entry amount = order totalAmount
- Link entry to orderId
- Status = "pending" (requires verification)

### 2. Transactions Integration
- When payment transaction created → Auto-create income entry
- When advance payment created → Auto-create income entry
- Link entry to transactionId

### 3. Client Ledger Integration
- Verified income entries update client ledger
- Maintain consistency between General Ledger and Client Ledger

### 4. Payment Accounts Integration
- Track which payment account received/disbursed funds
- Update payment account balances

---

## Permissions & Access Control

### Roles & Permissions

**Admin:**
- Create, edit, delete any entry
- Verify/reject entries
- View all entries
- Export data

**Manager:**
- Create, edit own entries
- View all entries
- Request verification
- Cannot verify entries

**Staff:**
- Create entries (limited to assigned categories)
- View own entries
- Cannot edit after submission
- Cannot verify

---

## Summary Statistics Calculations

### Net Income
```
Net Income = Total Income - Total Expense
```

### Payment Mode Distribution
```
For each payment mode:
  Percentage = (Amount in mode / Total Amount) × 100
```

### Daily/Period Summary
```
For each period:
  - Aggregate all entries in period
  - Calculate totals by category
  - Calculate payment mode distribution
  - Track verification status
```

---

## Future Enhancements

1. **Reconciliation:** Match entries with bank statements
2. **Recurring Entries:** Auto-create recurring expenses
3. **Budget Tracking:** Compare actual vs budget
4. **Tax Reports:** Generate GST/Tax reports
5. **Multi-Currency:** Support multiple currencies
6. **Approval Workflow:** Multi-level approval for large amounts
7. **Integration:** Export to accounting software (Tally, QuickBooks)

---

## Implementation Priority

### Phase 1: Core Functionality
1. Database schema setup
2. Basic CRUD operations
3. Entry creation from Orders
4. Simple summary calculations

### Phase 2: Verification System
1. Verification UI
2. Admin verification workflow
3. Status management

### Phase 3: Analytics & Reports
1. Summary calculations
2. Charts and visualizations
3. Export functionality

### Phase 4: Advanced Features
1. Reconciliation
2. Recurring entries
3. Budget tracking

---

## Notes

- All amounts stored as positive numbers, category determines income/expense
- Entry dates can be backdated for historical entries
- Verification is required before entries affect final summaries
- Summaries are pre-calculated for performance
- Support for both manual entries and auto-generated from Orders/Transactions

