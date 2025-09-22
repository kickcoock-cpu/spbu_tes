# Entity Relationship Diagram (ERD) - SPBU Management System

## Entities and Relationships

### 1. Roles
```
roles
-----
id (PK)
name
created_at
updated_at
```

### 2. SPBU
```
spbus
-----
id (PK)
name
location
code (UNIQUE)
is_active
created_at
updated_at
```

### 3. Users
```
users
-----
id (PK)
name
email (UNIQUE)
password
role_id (FK -> roles.id)
spbu_id (FK -> spbus.id, NULLABLE)
is_active
created_at
updated_at
```

### 4. Sales
```
sales
-----
id (PK)
spbu_id (FK -> spbus.id)
operator_id (FK -> users.id)
pump_number
fuel_type
liters
amount
transaction_date
created_at
updated_at
```

### 5. Deliveries
```
deliveries
----------
id (PK)
spbu_id (FK -> spbus.id)
supplier
fuel_type
liters
delivery_date
status
confirmed_by (FK -> users.id, NULLABLE)
approved_by (FK -> users.id, NULLABLE)
created_at
updated_at
```

### 6. Deposits
```
deposits
-------
id (PK)
spbu_id (FK -> spbus.id)
operator_id (FK -> users.id, NULLABLE)
amount
payment_method
status
approved_by (FK -> users.id, NULLABLE)
rejected_by (FK -> users.id, NULLABLE)
deposit_date
created_at
updated_at
```

### 7. Prices
```
prices
------
id (PK)
spbu_id (FK -> spbus.id, NULLABLE)
fuel_type
price
effective_date
updated_by (FK -> users.id)
created_at
updated_at
```

### 8. Attendance
```
attendance
----------
id (PK)
user_id (FK -> users.id)
spbu_id (FK -> spbus.id)
check_in
check_out
date
created_at
updated_at
```

### 9. Adjustments
```
adjustments
-----------
id (PK)
spbu_id (FK -> spbus.id)
operator_id (FK -> users.id, NULLABLE)
type
description
status
approved_by (FK -> users.id, NULLABLE)
rejected_by (FK -> users.id, NULLABLE)
created_at
updated_at
```

### 10. Audit Logs
```
audit_logs
----------
id (PK)
user_id (FK -> users.id, NULLABLE)
action
resource
resource_id
details (JSON)
timestamp
```

## Relationships Summary

1. **Roles** 1:N **Users** (One role can be assigned to many users)
2. **SPBU** 1:N **Users** (One SPBU can have many users)
3. **SPBU** 1:N **Sales** (One SPBU can have many sales)
4. **Users** 1:N **Sales** (One operator can create many sales)
5. **SPBU** 1:N **Deliveries** (One SPBU can have many deliveries)
6. **Users** 1:N **Deliveries** (confirmed_by, approved_by)
7. **SPBU** 1:N **Deposits** (One SPBU can have many deposits)
8. **Users** 1:N **Deposits** (operator_id, approved_by, rejected_by)
9. **SPBU** 1:N **Prices** (One SPBU can have many prices)
10. **Users** 1:N **Prices** (updated_by)
11. **Users** 1:N **Attendance** (One user can have many attendance records)
12. **SPBU** 1:N **Attendance** (One SPBU can have many attendance records)
13. **SPBU** 1:N **Adjustments** (One SPBU can have many adjustments)
14. **Users** 1:N **Adjustments** (operator_id, approved_by, rejected_by)
15. **Users** 1:N **Audit Logs** (One user can have many audit logs)