const { Ledger, Price, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Fungsi untuk menghitung total kumulatif credit dan debit untuk SPBU tertentu
 * @param {number} spbu_id - ID SPBU
 * @returns {Promise<Object>} - Object dengan total credit dan debit
 */
const calculateTotalCreditAndDebit = async (spbu_id) => {
  try {
    const result = await Ledger.findOne({
      where: { spbu_id },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit'],
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit']
      ],
      raw: true
    });

    const totalCredit = parseFloat(result.totalCredit) || 0;
    const totalDebit = parseFloat(result.totalDebit) || 0;
    const finalBalance = totalCredit - totalDebit;
    
    return {
      totalCredit,
      totalDebit,
      finalBalance
    };
  } catch (error) {
    console.error('Error calculating total credit and debit:', error);
    throw error;
  }
};

/**
 * Fungsi untuk menghitung balance kumulatif hingga tanggal tertentu
 * @param {number} spbu_id - ID SPBU
 * @param {Date} untilDate - Tanggal batas akhir perhitungan
 * @returns {Promise<number>} - Balance kumulatif hingga tanggal tertentu
 */
const calculateBalanceUntilDate = async (spbu_id, untilDate) => {
  try {
    const result = await Ledger.findOne({
      where: { 
        spbu_id,
        transaction_date: { [Op.lte]: untilDate }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit'],
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit']
      ],
      raw: true
    });

    const totalCredit = parseFloat(result.totalCredit) || 0;
    const totalDebit = parseFloat(result.totalDebit) || 0;
    
    // Rumus yang benar: total credit - total debit = final balance
    return totalCredit - totalDebit;
  } catch (error) {
    console.error('Error calculating balance until date:', error);
    throw error;
  }
};

/**
 * Fungsi untuk menghitung ulang balance untuk semua entri ledger
 * @param {number} spbu_id - ID SPBU
 */
const recalculateAllBalances = async (spbu_id) => {
  try {
    // Dapatkan semua entri ledger untuk SPBU tertentu, diurutkan berdasarkan tanggal
    const ledgerEntries = await Ledger.findAll({
      where: { spbu_id },
      order: [['transaction_date', 'ASC'], ['created_at', 'ASC']]
    });

    let runningCredit = 0;
    let runningDebit = 0;
    
    // Hitung ulang balance untuk setiap entri secara kumulatif
    for (const entry of ledgerEntries) {
      // Akumulasi total credit dan debit
      runningCredit += parseFloat(entry.credit);
      runningDebit += parseFloat(entry.debit);
      
      // Hitung balance berdasarkan rumus yang benar: total credit - total debit
      const balance = runningCredit - runningDebit;
      
      // Update balance di database
      await entry.update({ balance: balance });
    }
    
    console.log(`Recalculated balances for ${ledgerEntries.length} entries for SPBU ${spbu_id}`);
    return ledgerEntries.length;
  } catch (error) {
    console.error('Error recalculating balances:', error);
    throw error;
  }
};

/**
 * Fungsi untuk menghitung balance kumulatif untuk entri baru berdasarkan entri sebelumnya
 * @param {number} spbu_id - ID SPBU
 * @param {Date} transactionDate - Tanggal transaksi
 * @returns {Promise<number>} - Balance kumulatif hingga entri baru
 */
const calculateRunningBalance = async (spbu_id, transactionDate) => {
  try {
    // Hitung total kumulatif debit dan credit hingga tanggal transaksi
    const result = await Ledger.findOne({
      where: { 
        spbu_id,
        transaction_date: { [Op.lte]: transactionDate }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit'],
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit']
      ],
      raw: true
    });

    const totalCredit = parseFloat(result.totalCredit) || 0;
    const totalDebit = parseFloat(result.totalDebit) || 0;
    
    // Rumus yang benar: total credit - total debit = final balance
    return totalCredit - totalDebit;
  } catch (error) {
    console.error('Error calculating running balance:', error);
    throw error;
  }
};

/**
 * Fungsi untuk menambahkan entri ke buku besar
 * @param {Object} transactionData - Data transaksi
 * @param {number} transactionData.spbu_id - ID SPBU
 * @param {string} transactionData.transaction_type - Tipe transaksi (sale, delivery, deposit, adjustment, expense)
 * @param {number} transactionData.reference_id - ID referensi
 * @param {string} transactionData.reference_type - Tipe referensi
 * @param {string} transactionData.description - Deskripsi transaksi
 * @param {number} transactionData.debit - Jumlah debit
 * @param {number} transactionData.credit - Jumlah credit
 * @param {number} transactionData.created_by - ID user yang membuat entri
 */
const addLedgerEntry = async (transactionData) => {
  try {
    // Destructure data transaksi
    const {
      spbu_id,
      transaction_type,
      reference_id,
      reference_type,
      description,
      debit = 0,
      credit = 0,
      created_by
    } = transactionData;

    // Validasi data yang diperlukan
    if (!spbu_id || !transaction_type || !description) {
      throw new Error('Missing required fields: spbu_id, transaction_type, and description are required');
    }

    // Tentukan tanggal transaksi (gunakan yang diberikan atau tanggal sekarang)
    const transactionDate = transactionData.transaction_date || new Date();

    // Hitung balance kumulatif hingga tanggal transaksi
    const balance = await calculateRunningBalance(spbu_id, transactionDate);

    // Buat entri buku besar
    const ledgerEntry = await Ledger.create({
      spbu_id,
      transaction_type,
      reference_id: reference_id || null,
      reference_type: reference_type || null,
      description,
      debit,
      credit,
      balance,
      transaction_date: transactionDate,
      created_by: created_by || null
    });

    console.log('Ledger entry added successfully:', ledgerEntry.toJSON());
    return ledgerEntry;
  } catch (error) {
    console.error('Error adding ledger entry:', error);
    throw error;
  }
};

/**
 * Fungsi untuk mendapatkan harga berdasarkan tipe bahan bakar dan SPBU
 * @param {number} spbu_id - ID SPBU
 * @param {string} fuel_type - Tipe bahan bakar
 * @returns {Promise<number>} - Harga per liter
 */
const getPriceByFuelType = async (spbu_id, fuel_type) => {
  try {
    const price = await Price.findOne({
      where: {
        spbu_id,
        fuel_type
      },
      order: [['created_at', 'DESC']]
    });

    return price ? parseFloat(price.price) : 0;
  } catch (error) {
    console.error('Error getting price by fuel type:', error);
    return 0;
  }
};

/**
 * Fungsi untuk mencatat transaksi delivery ke buku besar
 * @param {Object} delivery - Data delivery
 * @param {number} delivery.spbu_id - ID SPBU
 * @param {number} delivery.id - ID delivery
 * @param {string} delivery.fuel_type - Tipe bahan bakar
 * @param {number} delivery.actual_liters - Jumlah liter
 * @param {number} delivery.created_by - ID user yang membuat entri
 */
const recordDeliveryTransaction = async (delivery) => {
  try {
    const { spbu_id, id, fuel_type, actual_liters, harga_beli, created_by } = delivery;
    
    // Gunakan harga_beli jika tersedia, jika tidak gunakan harga dari tabel prices
    let pricePerLiter;
    if (harga_beli) {
      pricePerLiter = parseFloat(harga_beli);
    } else {
      pricePerLiter = await getPriceByFuelType(spbu_id, fuel_type);
    }
    
    // Hitung total harga
    const totalAmount = actual_liters * pricePerLiter;
    
    // Catat transaksi ke buku besar (Debit)
    await addLedgerEntry({
      spbu_id,
      transaction_type: 'delivery',
      reference_id: id,
      reference_type: 'Delivery',
      description: `Delivery of ${actual_liters} liters of ${fuel_type} at ${pricePerLiter}/liter`,
      debit: totalAmount,
      credit: 0,
      created_by
    });
    
    console.log('Delivery transaction recorded in ledger');
  } catch (error) {
    console.error('Error recording delivery transaction:', error);
    throw error;
  }
};

/**
 * Fungsi untuk mencatat transaksi adjustment ke buku besar
 * @param {Object} adjustment - Data adjustment
 * @param {number} adjustment.spbu_id - ID SPBU
 * @param {number} adjustment.id - ID adjustment
 * @param {string} adjustment.fuel_type - Tipe bahan bakar
 * @param {number} adjustment.quantity - Jumlah liter
 * @param {string} adjustment.adjustment_type - Tipe adjustment (gain/loss)
 * @param {number} adjustment.created_by - ID user yang membuat entri
 * @param {string} adjustment.status - Status adjustment (approved/rejected)
 */
const recordAdjustmentTransaction = async (adjustment) => {
  try {
    const { spbu_id, id, fuel_type, quantity, adjustment_type, created_by, status } = adjustment;
    
    // Hanya proses jika status approved atau rejected
    if (status !== 'approved' && status !== 'rejected') {
      console.log('Adjustment not approved or rejected, skipping ledger entry');
      return;
    }
    
    // Dapatkan harga per liter
    const pricePerLiter = await getPriceByFuelType(spbu_id, fuel_type);
    
    // Hitung total nilai adjustment
    const totalAmount = quantity * pricePerLiter;
    
    let debit = 0;
    let credit = 0;
    let description = '';
    
    if (status === 'approved') {
      if (adjustment_type === 'gain') {
        // Adjustment gain disetujui = Credit
        credit = totalAmount;
        description = `Approved fuel gain adjustment of ${quantity} liters of ${fuel_type} at ${pricePerLiter}/liter`;
      } else if (adjustment_type === 'loss') {
        // Adjustment loss disetujui = Debit
        debit = totalAmount;
        description = `Approved fuel loss adjustment of ${quantity} liters of ${fuel_type} at ${pricePerLiter}/liter`;
      }
    } else if (status === 'rejected') {
      if (adjustment_type === 'gain') {
        // Adjustment gain ditolak = Debit
        debit = totalAmount;
        description = `Rejected fuel gain adjustment of ${quantity} liters of ${fuel_type} at ${pricePerLiter}/liter`;
      } else if (adjustment_type === 'loss') {
        // Adjustment loss ditolak = Credit
        credit = totalAmount;
        description = `Rejected fuel loss adjustment of ${quantity} liters of ${fuel_type} at ${pricePerLiter}/liter`;
      }
    }
    
    // Catat transaksi ke buku besar
    await addLedgerEntry({
      spbu_id,
      transaction_type: 'adjustment',
      reference_id: id,
      reference_type: 'Adjustment',
      description,
      debit,
      credit,
      created_by
    });
    
    console.log('Adjustment transaction recorded in ledger');
  } catch (error) {
    console.error('Error recording adjustment transaction:', error);
    throw error;
  }
};

/**
 * Fungsi untuk mencatat transaksi sale ke buku besar
 * @param {Object} sale - Data sale
 * @param {number} sale.spbu_id - ID SPBU
 * @param {number} sale.id - ID sale
 * @param {string} sale.fuel_type - Tipe bahan bakar
 * @param {number} sale.liters - Jumlah liter
 * @param {number} sale.amount - Jumlah uang
 * @param {number} sale.operator_id - ID operator
 */
const recordSaleTransaction = async (sale) => {
  try {
    const { spbu_id, id, fuel_type, liters, amount, operator_id } = sale;
    
    // Catat transaksi ke buku besar (Credit)
    await addLedgerEntry({
      spbu_id,
      transaction_type: 'sale',
      reference_id: id,
      reference_type: 'Sale',
      description: `Sale of ${liters} liters of ${fuel_type} for ${amount}`,
      debit: 0,
      credit: amount,
      created_by: operator_id
    });
    
    console.log('Sale transaction recorded in ledger');
  } catch (error) {
    console.error('Error recording sale transaction:', error);
    throw error;
  }
};

/**
 * Fungsi untuk mencatat transaksi deposit ke buku besar
 * @param {Object} deposit - Data deposit
 * @param {number} deposit.spbu_id - ID SPBU
 * @param {number} deposit.id - ID deposit
 * @param {number} deposit.amount - Jumlah uang
 * @param {number} deposit.created_by - ID user yang membuat entri
 * @param {string} deposit.status - Status deposit (approved/rejected)
 */
const recordDepositTransaction = async (deposit) => {
  try {
    const { spbu_id, id, amount, created_by, status } = deposit;
    
    // Hanya proses jika status approved atau rejected
    if (status !== 'approved' && status !== 'rejected') {
      console.log('Deposit not approved or rejected, skipping ledger entry');
      return;
    }
    
    let debit = 0;
    let credit = 0;
    let description = '';
    
    if (status === 'approved') {
      // Deposit disetujui = Debit (perbaikan sesuai permintaan)
      debit = amount;
      description = `Approved deposit of ${amount}`;
    } else if (status === 'rejected') {
      // Deposit ditolak = Credit (perbaikan logika)
      credit = amount;
      description = `Rejected deposit of ${amount}`;
    }
    
    // Catat transaksi ke buku besar
    await addLedgerEntry({
      spbu_id,
      transaction_type: 'deposit',
      reference_id: id,
      reference_type: 'Deposit',
      description,
      debit,
      credit,
      created_by
    });
    
    console.log('Deposit transaction recorded in ledger');
  } catch (error) {
    console.error('Error recording deposit transaction:', error);
    throw error;
  }
};

/**
 * Fungsi untuk memverifikasi konsistensi balance ledger
 * @param {number} spbu_id - ID SPBU
 * @returns {Promise<Object>} - Hasil verifikasi
 */
const verifyLedgerBalance = async (spbu_id) => {
  try {
    // Dapatkan semua entri ledger untuk SPBU tertentu, diurutkan berdasarkan tanggal
    const ledgerEntries = await Ledger.findAll({
      where: { spbu_id },
      order: [['transaction_date', 'ASC'], ['created_at', 'ASC']]
    });

    let runningCredit = 0;
    let runningDebit = 0;
    let inconsistencies = [];
    
    // Verifikasi setiap entri
    for (let i = 0; i < ledgerEntries.length; i++) {
      const entry = ledgerEntries[i];
      runningCredit += parseFloat(entry.credit);
      runningDebit += parseFloat(entry.debit);
      
      // Hitung balance yang seharusnya berdasarkan rumus: total credit - total debit
      const expectedBalance = runningCredit - runningDebit;
      const actualBalance = parseFloat(entry.balance);
      
      // Cek jika ada ketidaksesuaian
      if (Math.abs(expectedBalance - actualBalance) > 0.01) { // Menggunakan toleransi 0.01 untuk floating point
        inconsistencies.push({
          entryId: entry.id,
          transactionDate: entry.transaction_date,
          description: entry.description,
          expectedBalance,
          actualBalance,
          difference: expectedBalance - actualBalance
        });
      }
    }
    
    const finalBalance = runningCredit - runningDebit;
    
    return {
      totalEntries: ledgerEntries.length,
      totalCredit: runningCredit,
      totalDebit: runningDebit,
      finalBalance,
      inconsistencies,
      isConsistent: inconsistencies.length === 0
    };
  } catch (error) {
    console.error('Error verifying ledger balance:', error);
    throw error;
  }
};

module.exports = {
  addLedgerEntry,
  recordDeliveryTransaction,
  recordAdjustmentTransaction,
  recordSaleTransaction,
  recordDepositTransaction,
  calculateTotalCreditAndDebit,
  calculateBalanceUntilDate,
  calculateRunningBalance,
  recalculateAllBalances,
  verifyLedgerBalance
};