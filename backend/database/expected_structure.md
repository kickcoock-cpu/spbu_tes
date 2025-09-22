# Struktur Database yang Diharapkan Setelah Migrasi dan Seed

## Tabel yang Dibuat

1. **roles**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - name (VARCHAR(50), UNIQUE)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **spbus**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - name (VARCHAR(100))
   - location (TEXT)
   - code (VARCHAR(50), UNIQUE)
   - is_active (BOOLEAN)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. **users**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - name (VARCHAR(100))
   - email (VARCHAR(100), UNIQUE)
   - password (VARCHAR(255))
   - role_id (INT, FOREIGN KEY ke roles.id)
   - spbu_id (INT, NULLABLE, FOREIGN KEY ke spbus.id)
   - is_active (BOOLEAN)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. **sales**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - spbu_id (INT, FOREIGN KEY ke spbus.id)
   - operator_id (INT, FOREIGN KEY ke users.id)
   - pump_number (INT)
   - fuel_type (ENUM: Premium, Pertamax, Pertalite, Solar, Dexlite)
   - liters (DECIMAL(10,2))
   - amount (DECIMAL(10,2))
   - transaction_date (TIMESTAMP)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

5. **deliveries**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - spbu_id (INT, FOREIGN KEY ke spbus.id)
   - supplier (VARCHAR(100))
   - fuel_type (ENUM: Premium, Pertamax, Pertalite, Solar, Dexlite)
   - liters (DECIMAL(10,2))
   - delivery_date (TIMESTAMP)
   - status (ENUM: pending, confirmed, approved)
   - confirmed_by (INT, NULLABLE, FOREIGN KEY ke users.id)
   - approved_by (INT, NULLABLE, FOREIGN KEY ke users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

6. **deposits**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - spbu_id (INT, FOREIGN KEY ke spbus.id)
   - operator_id (INT, NULLABLE, FOREIGN KEY ke users.id)
   - amount (DECIMAL(10,2))
   - payment_method (ENUM: cash, transfer, check)
   - status (ENUM: pending, approved, rejected)
   - approved_by (INT, NULLABLE, FOREIGN KEY ke users.id)
   - rejected_by (INT, NULLABLE, FOREIGN KEY ke users.id)
   - deposit_date (TIMESTAMP)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

7. **prices**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - spbu_id (INT, NULLABLE, FOREIGN KEY ke spbus.id)
   - fuel_type (ENUM: Premium, Pertamax, Pertalite, Solar, Dexlite)
   - price (DECIMAL(10,2))
   - effective_date (TIMESTAMP)
   - updated_by (INT, FOREIGN KEY ke users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

8. **attendance**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - user_id (INT, FOREIGN KEY ke users.id)
   - spbu_id (INT, FOREIGN KEY ke spbus.id)
   - check_in (TIMESTAMP, NULLABLE)
   - check_out (TIMESTAMP, NULLABLE)
   - date (DATE)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

9. **adjustments**
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - spbu_id (INT, FOREIGN KEY ke spbus.id)
   - operator_id (INT, NULLABLE, FOREIGN KEY ke users.id)
   - type (ENUM: fuel, equipment, other)
   - description (TEXT)
   - status (ENUM: pending, approved, rejected)
   - approved_by (INT, NULLABLE, FOREIGN KEY ke users.id)
   - rejected_by (INT, NULLABLE, FOREIGN KEY ke users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

10. **audit_logs**
    - id (INT, PRIMARY KEY, AUTO_INCREMENT)
    - user_id (INT, NULLABLE, FOREIGN KEY ke users.id)
    - action (VARCHAR(100))
    - resource (VARCHAR(100))
    - resource_id (VARCHAR(100), NULLABLE)
    - details (JSON, NULLABLE)
    - timestamp (TIMESTAMP)

## Data yang Dihasilkan Setelah Seed

1. **roles**: 3 records
2. **spbus**: 5 records
3. **users**: 10 records
4. **sales**: 200 records
5. **deliveries**: 50 records
6. **deposits**: 80 records
7. **prices**: 18 records
8. **attendance**: 180 records
9. **adjustments**: 40 records
10. **audit_logs**: 100 records

Total: Sekitar 671 records data