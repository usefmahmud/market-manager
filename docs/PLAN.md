# Market Manager — Business & Features Plan

## Product Vision

A stock management app for a single supermarket. Handles products, categories, inventory tracking, point-of-sale checkout, sales receipts, and analytics. Built for admin and cashier roles.

## User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access — products, categories, stock, invoices, analytics, settings, user management |
| **Cashier** | Checkout, view products, print receipts, view own sales history |

## Feature Modules

### 1. Products

Manage the product catalog.

- Add, edit, delete products
- Fields: name, barcode (unique), category, price, unit (piece/kg/liter), description, image
- Search and filter by name, category, barcode
- Bulk import via CSV (admin only)
- Barcode generation for products without one

### 2. Categories

Organize products into groups.

- Add, edit, delete categories
- Fields: name, description, parent (optional, for nested categories)
- Product count per category
- Reorder categories

### 3. Stock Management

Track inventory levels and receive stock.

- View current stock levels per product
- Low stock alerts (configurable threshold)
- Receive stock: select product, enter quantity, supplier name, note
- Stock adjustment: manual correction with reason
- Stock history: log of all stock changes with timestamps
- Barcode scan to quickly find product when receiving

### 4. Checkout (POS)

Cashier terminal for sales.

- Full-screen POS interface
- Scan barcode or search to add items
- Quantity adjustment, item removal
- Cart total with tax calculation
- Payment methods: cash, card, mixed
- Generate sales receipt (invoice)
- Daily cash drawer open/close
- Keyboard shortcuts for speed

### 5. Invoices (Sales Receipts)

Record of every sale.

- Invoice number (auto-generated, sequential)
- Items sold with quantities and prices
- Payment method, total, tax
- Cashier who processed the sale
- Timestamp
- Print receipt
- View invoice history with filters (date range, cashier)
- Void/refund an invoice (admin only)

### 6. Analytics

Sales and inventory insights.

- Sales summary: daily, weekly, monthly, custom range
- Top selling products
- Revenue by category
- Revenue by payment method
- Low stock report
- Stock value report
- Cashier performance (sales count, total)
- Export reports to CSV

### 7. Settings

App configuration.

- Store name, address, phone, tax rate
- Low stock threshold
- Receipt header/footer text
- Currency symbol
- User management (admin only): add cashiers, reset passwords

## Data Model (High-Level)

```
┌─────────────┐     ┌──────────────┐
│  categories  │────<│   products    │
└─────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              ┌─────┴─────┐ ┌────┴────┐
              │   stock    │ │ invoices │
              │  receipts  │ │  (sales) │
              └───────────┘ └────┬────┘
                                 │
                          ┌──────┴──────┐
                          │ invoice_items│
                          └─────────────┘

┌─────────────┐
│    users     │  (admin + cashiers)
└─────────────┘
```

### Key Entities

**products**
- id, name, barcode (unique), category_id, price, unit, description, image, created_at, updated_at

**categories**
- id, name, description, parent_id (nullable), created_at

**stock_receipts**
- id, product_id, quantity, supplier, note, received_by (user_id), created_at

**invoices**
- id, invoice_number (sequential), user_id (cashier), payment_method, subtotal, tax, total, created_at

**invoice_items**
- id, invoice_id, product_id, quantity, unit_price, total

**users**
- id, name, email, role (admin/cashier), password_hash, created_at

## User Flows

### Receiving Stock

1. Admin/warehouse staff opens Stock page
2. Scans product barcode or searches by name
3. Enters quantity received, supplier name, optional note
4. Confirms — stock level updates, entry logged

### Checkout (Sale)

1. Cashier opens POS terminal
2. Scans product barcode (or searches)
3. Product added to cart with quantity 1
4. Repeat for all items
5. Adjusts quantities if needed
6. Clicks "Pay" — selects payment method
7. Enters amount received (for cash)
8. Confirms — invoice created, receipt printed, stock decremented

### Viewing Reports

1. Admin opens Analytics
2. Selects date range or preset (today, this week, etc.)
3. Views charts: sales over time, top products, revenue by category
4. Exports to CSV if needed

## Future Considerations

- Multi-supplier management
- Purchase orders (supplier invoices)
- Expiry date tracking
- Promotions and discounts
- Customer loyalty
- Multi-location support
- Mobile app for stock checks
