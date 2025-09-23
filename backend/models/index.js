const { sequelize } = require('../config/db');
const Role = require('./Role');
const SPBU = require('./SPBU');
const User = require('./User');
const Sale = require('./Sale');
const Delivery = require('./Delivery');
const Deposit = require('./Deposit');
const Price = require('./Price');
const Attendance = require('./Attendance');
const Adjustment = require('./Adjustment');
const AuditLog = require('./AuditLog');
const FuelStock = require('./FuelStock');
const Tank = require('./Tank');
const Ledger = require('./Ledger');
const FuelType = require('./FuelType');

// Definisikan relasi antar model
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

SPBU.hasMany(User, { foreignKey: 'spbu_id' });
User.belongsTo(SPBU, { foreignKey: 'spbu_id' });

SPBU.hasMany(Sale, { foreignKey: 'spbu_id' });
Sale.belongsTo(SPBU, { foreignKey: 'spbu_id' });
User.hasMany(Sale, { foreignKey: 'operator_id' });
Sale.belongsTo(User, { foreignKey: 'operator_id', as: 'operator' });
Sale.belongsTo(FuelType, { foreignKey: 'fuel_type_id' });
FuelType.hasMany(Sale, { foreignKey: 'fuel_type_id' });

SPBU.hasMany(Delivery, { foreignKey: 'spbu_id' });
Delivery.belongsTo(SPBU, { foreignKey: 'spbu_id' });
Delivery.belongsTo(FuelType, { foreignKey: 'fuel_type_id' });
FuelType.hasMany(Delivery, { foreignKey: 'fuel_type_id' });
User.hasMany(Delivery, { foreignKey: 'confirmed_by' });
Delivery.belongsTo(User, { foreignKey: 'confirmed_by', as: 'confirmer' });
User.hasMany(Delivery, { foreignKey: 'approved_by' });
Delivery.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

SPBU.hasMany(Deposit, { foreignKey: 'spbu_id' });
Deposit.belongsTo(SPBU, { foreignKey: 'spbu_id' });
User.hasMany(Deposit, { foreignKey: 'operator_id' });
Deposit.belongsTo(User, { foreignKey: 'operator_id', as: 'operator' });
User.hasMany(Deposit, { foreignKey: 'approved_by' });
Deposit.belongsTo(User, { foreignKey: 'approved_by', as: 'depositor_approver' });
User.hasMany(Deposit, { foreignKey: 'rejected_by' });
Deposit.belongsTo(User, { foreignKey: 'rejected_by', as: 'depositor_rejector' });

SPBU.hasMany(Price, { foreignKey: 'spbu_id' });
Price.belongsTo(SPBU, { foreignKey: 'spbu_id' });
User.hasMany(Price, { foreignKey: 'updated_by' });
Price.belongsTo(User, { foreignKey: 'updated_by', as: 'updated_by_user' });

SPBU.hasMany(Attendance, { foreignKey: 'spbu_id' });
Attendance.belongsTo(SPBU, { foreignKey: 'spbu_id' });
User.hasMany(Attendance, { foreignKey: 'user_id' });
Attendance.belongsTo(User, { foreignKey: 'user_id' });

SPBU.hasMany(Adjustment, { foreignKey: 'spbu_id' });
Adjustment.belongsTo(SPBU, { foreignKey: 'spbu_id' });
User.hasMany(Adjustment, { foreignKey: 'operator_id' });
Adjustment.belongsTo(User, { foreignKey: 'operator_id', as: 'operator' });
User.hasMany(Adjustment, { foreignKey: 'approved_by' });
Adjustment.belongsTo(User, { foreignKey: 'approved_by', as: 'adjustment_approver' });
User.hasMany(Adjustment, { foreignKey: 'rejected_by' });
Adjustment.belongsTo(User, { foreignKey: 'rejected_by', as: 'adjustment_rejector' });
Tank.hasMany(Adjustment, { foreignKey: 'tank_id' });
Adjustment.belongsTo(Tank, { foreignKey: 'tank_id' });

SPBU.hasMany(FuelStock, { foreignKey: 'spbu_id' });
FuelStock.belongsTo(SPBU, { foreignKey: 'spbu_id' });

SPBU.hasMany(Tank, { foreignKey: 'spbu_id' });
Tank.belongsTo(SPBU, { foreignKey: 'spbu_id' });

// Relationship between Ledger and SPBU
SPBU.hasMany(Ledger, { foreignKey: 'spbu_id' });
Ledger.belongsTo(SPBU, { foreignKey: 'spbu_id' });

// Relationship between Ledger and User (for tracking who made the entry)
User.hasMany(Ledger, { foreignKey: 'created_by' });
Ledger.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Relationship between Sale and FuelType
Sale.belongsTo(FuelType, { foreignKey: 'fuel_type_id' });
FuelType.hasMany(Sale, { foreignKey: 'fuel_type_id' });

User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// Export semua model dan sequelize instance
module.exports = {
  sequelize,
  Role,
  SPBU,
  User,
  Sale,
  Delivery,
  Deposit,
  Price,
  Attendance,
  Adjustment,
  AuditLog,
  FuelStock,
  Tank,
  Ledger,
  FuelType
};