# 💳 Tích Hợp Thanh Toán Trực Tuyến Việt Nam - Implementation Plan

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-01-15  
> **Trạng thái:** DRAFT - Chờ duyệt

---

## 📌 Tổng Quan

### Mục tiêu
Tích hợp các cổng thanh toán trực tuyến phổ biến tại Việt Nam (VNPay, MoMo, ZaloPay) vào SuperApp, cho phép người dùng thực hiện thanh toán an toàn và tiện lợi.

### Payment Gateways được hỗ trợ

| Provider | Tính năng | API Type | Phổ biến |
|----------|-----------|----------|----------|
| **VNPay** | QR Pay, ATM, Visa/Master, Banking | REST + Redirect | ⭐⭐⭐⭐⭐ |
| **MoMo** | Ví MoMo, QR Pay | REST API | ⭐⭐⭐⭐⭐ |
| **ZaloPay** | Ví ZaloPay, ATM, Visa, VietQR, Apple Pay | REST API | ⭐⭐⭐⭐ |

### Luồng thanh toán chung

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User UI   │────▶│  API Server │────▶│   Payment   │────▶│   Gateway   │
│  (Frontend) │     │  (Backend)  │     │   Service   │     │   (VNPay)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Redirect  │◀────│   Payment   │◀────│   Webhook   │◀────│   Gateway   │
│   Success   │     │   Updated   │     │    (IPN)    │     │   Callback  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## ⚠️ User Review Required

### Breaking Changes?
- [ ] **Có** - Cần thêm các biến môi trường mới cho Payment Gateway credentials
- [ ] **Có** - Cần tạo database collections mới (payments, payment_transactions)
- [ ] **Có** - Cần permission mới: `payments:create`, `payments:view`, `payments:manage`

### Logic phức tạp cần confirm?
- [ ] **Webhook Security** - Xác thực IPN callback từ gateway (signature verification)
- [ ] **Transaction State Machine** - Pending → Processing → Success/Failed/Cancelled
- [ ] **Retry Logic** - Xử lý khi callback không nhận được
- [ ] **Refund Flow** - Hoàn tiền một phần hoặc toàn bộ

### Câu hỏi cần làm rõ trước khi triển khai:
1. **Sản phẩm/Dịch vụ nào cần thanh toán?** (Gói subscription, Mua hàng, Nạp tiền...)
2. **Cần hỗ trợ hoàn tiền (refund) không?**
3. **Thanh toán định kỳ (recurring) có cần không?**
4. **Giới hạn số tiền giao dịch tối thiểu/tối đa?**
5. **Lưu trữ thông tin thanh toán để thanh toán nhanh lần sau?**
6. **Sandbox/Test credentials đã có chưa?**

---

## 🔄 Proposed Changes

### Phase 1: Core Infrastructure (Backend)

#### 1.1 Database Collections

##### `[NEW] apps/api-server/src/database/collections/payments.ts`
```typescript
// Collection: payments
// Stores payment records
{
  id: string;
  userId: string;                    // Reference to users
  orderId: string;                   // Internal order/reference ID
  amount: number;                    // Amount in VND
  currency: 'VND';                   // Fixed for Vietnam
  provider: 'vnpay' | 'momo' | 'zalopay';
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;             // ATM, QR, Visa, etc.
  transactionId: string;             // Gateway transaction ID
  metadata: JSON;                    // Provider-specific data
  paidAt: datetime;                  // When payment was confirmed
  refundedAt: datetime;              // If refunded
  created: datetime;
  updated: datetime;
}
```

##### `[NEW] apps/api-server/src/database/collections/payment_transactions.ts`
```typescript
// Collection: payment_transactions
// Audit log for all payment events
{
  id: string;
  paymentId: string;                 // Reference to payments
  type: 'create' | 'update' | 'callback' | 'refund';
  status: string;
  rawData: JSON;                     // Raw payload from gateway
  ipAddress: string;
  created: datetime;
}
```

#### 1.2 Environment Variables

##### `[MODIFY] apps/api-server/.env.example`
```bash
# Payment Gateway - VNPay
VNPAY_TMN_CODE=your_merchant_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=${CLIENT_URL}/payment/result
VNPAY_IPN_URL=${SERVER_URL}/api/payments/webhook/vnpay

# Payment Gateway - MoMo
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_API_URL=https://test-payment.momo.vn

# Payment Gateway - ZaloPay
ZALOPAY_APP_ID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
ZALOPAY_API_URL=https://sb-openapi.zalopay.vn
```

#### 1.3 Backend Services

##### `[NEW] apps/api-server/src/services/payment.service.ts`
```typescript
// Extends BaseService
// - createPayment(userId, amount, provider, metadata)
// - updatePaymentStatus(id, status, transactionData)
// - getPaymentsByUser(userId, pagination)
// - getPaymentById(id)
// - processRefund(id, amount?)
```

##### `[NEW] apps/api-server/src/services/payment-providers/vnpay.provider.ts`
```typescript
// VNPay Integration
// - createPaymentUrl(payment, returnUrl)
// - verifyReturnUrl(queryParams)
// - verifyIpn(body)
// - buildSecureHash(params)
```

##### `[NEW] apps/api-server/src/services/payment-providers/momo.provider.ts`
```typescript
// MoMo Integration
// - createPaymentRequest(payment)
// - verifyCallback(body, signature)
// - checkTransactionStatus(requestId)
// - refund(transactionId, amount)
```

##### `[NEW] apps/api-server/src/services/payment-providers/zalopay.provider.ts`
```typescript
// ZaloPay Integration
// - createOrder(payment)
// - verifyCallback(body, mac)
// - queryOrder(appTransId)
// - refund(zpTransId, amount)
```

##### `[NEW] apps/api-server/src/services/payment-providers/index.ts`
```typescript
// Provider Factory
// - getProvider(name: 'vnpay' | 'momo' | 'zalopay')
// - Unified interface for all providers
```

#### 1.4 Backend Controllers & Routes

##### `[NEW] apps/api-server/src/controllers/payment.controller.ts`
```typescript
// Endpoints:
// - POST   /payments                    - Create new payment
// - GET    /payments                    - List user's payments
// - GET    /payments/:id                - Get payment details
// - POST   /payments/:id/refund         - Request refund
// - POST   /payments/webhook/vnpay      - VNPay IPN callback
// - POST   /payments/webhook/momo       - MoMo callback
// - POST   /payments/webhook/zalopay    - ZaloPay callback
```

##### `[NEW] apps/api-server/src/routes/payment.ts`
```typescript
// Route definitions with middleware
// - requireAuth for user endpoints
// - validateBody for input validation
// - Raw body parser for webhook endpoints
```

##### `[MODIFY] apps/api-server/src/routes/index.ts`
```typescript
// Add payment routes
import paymentRoutes from './payment.js';
router.use('/payments', paymentRoutes);
```

#### 1.5 Backend Schemas

##### `[NEW] apps/api-server/src/schemas/payment.schema.ts`
```typescript
// Zod schemas:
// - createPaymentSchema
// - refundPaymentSchema
// - vnpayCallbackSchema
// - momoCallbackSchema
// - zalopayCallbackSchema
```

---

### Phase 2: Shared Types

##### `[NEW] packages/shared-types/src/payment.ts`
```typescript
// Types:
export interface Payment { ... }
export interface PaymentTransaction { ... }
export type PaymentProvider = 'vnpay' | 'momo' | 'zalopay';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
export interface CreatePaymentInput { ... }
export interface PaymentListParams extends PaginationParams { ... }
export interface PaginatedPayments extends PaginatedResponse<Payment> { ... }

// Enums:
export enum PaymentMethod {
  ATM = 'atm',
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  QR = 'qr',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
}
```

##### `[MODIFY] packages/shared-types/src/common.ts`
```typescript
// Add to PermissionResource enum:
export enum PermissionResource {
  // ... existing
  Payments = 'payments',
}
```

##### `[MODIFY] packages/shared-types/src/index.ts`
```typescript
// Export payment types
export * from './payment.js';
```

---

### Phase 3: Frontend Integration

#### 3.1 Frontend Services

##### `[NEW] apps/web-core/src/services/payment.service.ts`
```typescript
// Service methods:
// - createPayment(data: CreatePaymentInput)
// - getPayments(params?: PaymentListParams)
// - getPaymentById(id: string)
// - cancelPayment(id: string)
// - getPaymentMethods()
```

#### 3.2 Frontend Hooks

##### `[NEW] apps/web-core/src/hooks/usePayments.ts`
```typescript
// Following Category pattern:
// - payments state
// - loading states (loading, submitting)
// - pagination state
// - CRUD functions
// - fetchPayments, createPayment, etc.
```

#### 3.3 Frontend Pages & Components

##### `[NEW] apps/web-core/src/pages/Payments/PaymentsPage.tsx`
```typescript
// Main page for viewing payment history
// - Filter by status, date range, provider
// - View payment details
// - Export to Excel
```

##### `[NEW] apps/web-core/src/pages/Payments/components/PaymentForm.tsx`
```typescript
// Payment creation form
// - Select payment provider (VNPay, MoMo, ZaloPay)
// - Enter amount
// - Select payment method
// - Proceed to payment
```

##### `[NEW] apps/web-core/src/pages/Payments/components/PaymentTable.tsx`
```typescript
// Table view of payments
// Following CategoryTable pattern
```

##### `[NEW] apps/web-core/src/pages/Payments/components/PaymentRow.tsx`
```typescript
// Card/Row view for mobile
```

##### `[NEW] apps/web-core/src/pages/Payments/components/PaymentSkeleton.tsx`
```typescript
// Loading skeleton
```

##### `[NEW] apps/web-core/src/pages/Payments/components/PaymentStatusBadge.tsx`
```typescript
// Status badge with colors:
// - pending: yellow
// - processing: blue
// - success: green
// - failed: red
// - cancelled: gray
// - refunded: purple
```

##### `[NEW] apps/web-core/src/pages/Payments/components/PaymentProviderIcon.tsx`
```typescript
// Provider logos/icons
// - VNPay, MoMo, ZaloPay
```

##### `[NEW] apps/web-core/src/pages/Payments/PaymentResultPage.tsx`
```typescript
// Callback/Return page after payment
// - Show success/failure status
// - Parse query params from gateway
// - Redirect to payment history
```

##### `[NEW] apps/web-core/src/pages/Payments/PaymentCheckoutPage.tsx`
```typescript
// Checkout page
// - Summary of what user is paying for
// - Select payment method
// - Provider selection
// - Redirect to gateway
```

#### 3.4 Routing

##### `[MODIFY] apps/web-core/src/AppRoutes.tsx`
```typescript
// Add payment routes:
// - /payments                  - Payment history (ProtectedRoute)
// - /payments/checkout         - Checkout page (ProtectedRoute)
// - /payment/result            - Return from gateway (Public)
```

#### 3.5 i18n

##### `[NEW] apps/web-core/src/locales/en/payments.json`
```json
{
  "entity": "Payment",
  "entities": "Payments",
  "title": "Payment History",
  "form": {
    "amount": "Amount",
    "provider": "Payment Provider",
    "method": "Payment Method"
  },
  "status": {
    "pending": "Pending",
    "processing": "Processing",
    "success": "Success",
    "failed": "Failed",
    "cancelled": "Cancelled",
    "refunded": "Refunded"
  },
  "provider": {
    "vnpay": "VNPay",
    "momo": "MoMo",
    "zalopay": "ZaloPay"
  },
  "checkout": {
    "title": "Checkout",
    "select_provider": "Select Payment Method",
    "proceed": "Proceed to Payment",
    "summary": "Order Summary"
  },
  "result": {
    "success": "Payment Successful",
    "failed": "Payment Failed",
    "pending": "Payment Pending"
  }
}
```

##### `[NEW] apps/web-core/src/locales/vi/payments.json`
```json
{
  "entity": "Thanh toán",
  "entities": "Thanh toán",
  "title": "Lịch sử thanh toán",
  "form": {
    "amount": "Số tiền",
    "provider": "Cổng thanh toán",
    "method": "Phương thức"
  },
  "status": {
    "pending": "Chờ xử lý",
    "processing": "Đang xử lý",
    "success": "Thành công",
    "failed": "Thất bại",
    "cancelled": "Đã hủy",
    "refunded": "Đã hoàn tiền"
  },
  "provider": {
    "vnpay": "VNPay",
    "momo": "MoMo",
    "zalopay": "ZaloPay"
  },
  "checkout": {
    "title": "Thanh toán",
    "select_provider": "Chọn phương thức thanh toán",
    "proceed": "Tiến hành thanh toán",
    "summary": "Thông tin đơn hàng"
  },
  "result": {
    "success": "Thanh toán thành công",
    "failed": "Thanh toán thất bại",
    "pending": "Đang chờ xác nhận"
  }
}
```

##### `[NEW] apps/web-core/src/locales/ko/payments.json`
```json
{
  "entity": "결제",
  "entities": "결제",
  "title": "결제 내역",
  "form": {
    "amount": "금액",
    "provider": "결제 제공업체",
    "method": "결제 방법"
  },
  "status": {
    "pending": "대기 중",
    "processing": "처리 중",
    "success": "성공",
    "failed": "실패",
    "cancelled": "취소됨",
    "refunded": "환불됨"
  },
  "provider": {
    "vnpay": "VNPay",
    "momo": "MoMo",
    "zalopay": "ZaloPay"
  },
  "checkout": {
    "title": "결제",
    "select_provider": "결제 방법 선택",
    "proceed": "결제 진행",
    "summary": "주문 요약"
  },
  "result": {
    "success": "결제 성공",
    "failed": "결제 실패",
    "pending": "확인 대기 중"
  }
}
```

##### `[MODIFY] apps/web-core/src/config/i18n.ts`
```typescript
// Add 'payments' to namespaces
```

---

### Phase 4: Admin Management (Optional)

#### 4.1 Admin Pages

##### `[NEW] apps/web-core/src/pages/Admin/Payments/AdminPaymentsPage.tsx`
```typescript
// Admin view for all payments
// - View all transactions
// - Filter by user, status, date
// - Manual status update (for support)
// - Initiate refund
```

---

## 📋 File Summary

### New Files (31 files)

| Layer | File | Mô tả |
|-------|------|-------|
| **DB** | `database/collections/payments.ts` | Payment collection schema |
| **DB** | `database/collections/payment_transactions.ts` | Transaction log schema |
| **Backend** | `services/payment.service.ts` | Payment business logic |
| **Backend** | `services/payment-providers/vnpay.provider.ts` | VNPay integration |
| **Backend** | `services/payment-providers/momo.provider.ts` | MoMo integration |
| **Backend** | `services/payment-providers/zalopay.provider.ts` | ZaloPay integration |
| **Backend** | `services/payment-providers/index.ts` | Provider factory |
| **Backend** | `controllers/payment.controller.ts` | HTTP handlers |
| **Backend** | `routes/payment.ts` | Route definitions |
| **Backend** | `schemas/payment.schema.ts` | Zod validation |
| **Shared** | `shared-types/src/payment.ts` | TypeScript types |
| **Frontend** | `services/payment.service.ts` | API client |
| **Frontend** | `hooks/usePayments.ts` | React hook |
| **Frontend** | `pages/Payments/PaymentsPage.tsx` | Payment history page |
| **Frontend** | `pages/Payments/PaymentCheckoutPage.tsx` | Checkout page |
| **Frontend** | `pages/Payments/PaymentResultPage.tsx` | Result page |
| **Frontend** | `pages/Payments/components/*` | 6 components |
| **i18n** | `locales/en/payments.json` | English translations |
| **i18n** | `locales/vi/payments.json` | Vietnamese translations |
| **i18n** | `locales/ko/payments.json` | Korean translations |
| **Admin** | `pages/Admin/Payments/AdminPaymentsPage.tsx` | Admin payment management |

### Modified Files (5 files)

| File | Thay đổi |
|------|----------|
| `apps/api-server/src/routes/index.ts` | Add payment routes |
| `apps/api-server/.env.example` | Add payment env vars |
| `packages/shared-types/src/common.ts` | Add Payments to PermissionResource |
| `packages/shared-types/src/index.ts` | Export payment types |
| `apps/web-core/src/AppRoutes.tsx` | Add payment routes |
| `apps/web-core/src/config/i18n.ts` | Add payments namespace |

---

## ✅ Verification Plan

### 1. Security Checks
- [ ] Webhook signature verification for all providers
- [ ] HTTPS only for all payment endpoints
- [ ] IP whitelist for webhook endpoints (if supported)
- [ ] Sensitive data not logged (card numbers, etc.)
- [ ] CSRF protection on payment forms

### 2. Functional Tests
- [ ] Create payment → Redirect to gateway
- [ ] Gateway callback → Status updated correctly
- [ ] IPN webhook → Transaction logged
- [ ] Refund flow works
- [ ] Duplicate callback handling (idempotent)

### 3. UI/UX Checks
- [ ] Payment form responsive (mobile/desktop)
- [ ] Loading states during payment
- [ ] Error messages clear and helpful
- [ ] Success/failure pages styled
- [ ] Provider logos display correctly

### 4. i18n Checks
- [ ] All keys exist in EN, VI, KO
- [ ] Status labels translated
- [ ] Error messages translated
- [ ] Currency formatting (VND)

### 5. Consistency with SSoT (Categories)
- [ ] Page structure matches CategoriesPage
- [ ] Hook pattern matches useCategories
- [ ] Service pattern matches categoryService
- [ ] Table/Row components match patterns

---

## 📅 Implementation Order (Suggested)

```
Week 1: Phase 1 (Backend Infrastructure)
├── Day 1-2: Database schema & migrations
├── Day 3-4: Payment service & VNPay provider
└── Day 5: Controllers, routes, webhooks

Week 2: Phase 2-3 (Types & Frontend)
├── Day 1: Shared types
├── Day 2-3: Frontend service & hooks
├── Day 4-5: UI pages & components

Week 3: Phase 4 + Testing
├── Day 1-2: Admin pages
├── Day 3-4: Integration testing
└── Day 5: Security audit & fixes
```

---

## 🔗 Tài liệu tham khảo

- [VNPay API Documentation](https://sandbox.vnpayment.vn/apis)
- [MoMo Developer Portal](https://developers.momo.vn/)
- [ZaloPay OpenAPI](https://docs.zalopay.vn/)

---

**⚠️ QUAN TRỌNG:** Plan này cần được User duyệt trước khi bắt đầu triển khai. Vui lòng xác nhận các câu hỏi trong phần "User Review Required" để tôi có thể điều chỉnh plan cho phù hợp.
