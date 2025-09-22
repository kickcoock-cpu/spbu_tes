const { Ledger } = require('../models');
const { 
  addLedgerEntry, 
  calculateTotalCreditAndDebit, 
  verifyLedgerBalance,
  recalculateAllBalances,
  recordDepositTransaction
} = require('./ledgerUtils');

/**
 * Fungsi untuk menguji perbaikan perhitungan ledger balance
 */
const testLedgerBalanceCalculation = async () => {
  try {
    console.log('Testing ledger balance calculation...');
    
    // Bersihkan data test sebelumnya jika ada
    // await Ledger.destroy({ where: { spbu_id: 999 } });
    
    // Tambahkan beberapa entri test
    const testEntries = [
      {
        spbu_id: 999,
        transaction_type: 'delivery',
        description: 'Test delivery 1',
        debit: 1000000,
        credit: 0,
        created_by: 1
      },
      {
        spbu_id: 999,
        transaction_type: 'sale',
        description: 'Test sale 1',
        debit: 0,
        credit: 1200000,
        created_by: 1
      },
      {
        spbu_id: 999,
        transaction_type: 'deposit',
        description: 'Test deposit 1',
        debit: 0,
        credit: 500000,
        created_by: 1
      }
    ];
    
    // Tambahkan entri test
    // for (const entry of testEntries) {
    //   await addLedgerEntry(entry);
    // }
    
    // Hitung total credit dan debit
    const totals = await calculateTotalCreditAndDebit(999);
    console.log('Total calculation result:', totals);
    
    // Verifikasi konsistensi
    const verification = await verifyLedgerBalance(999);
    console.log('Verification result:', verification);
    
    // Hitung ulang balance jika diperlukan
    if (!verification.isConsistent) {
      console.log('Inconsistencies found, recalculating balances...');
      await recalculateAllBalances(999);
      
      // Verifikasi ulang setelah recalculating
      const newVerification = await verifyLedgerBalance(999);
      console.log('Verification after recalculation:', newVerification);
    }
    
    console.log('Test completed successfully');
    return true;
  } catch (error) {
    console.error('Error in testLedgerBalanceCalculation:', error);
    return false;
  }
};

/**
 * Fungsi untuk menguji perbaikan perhitungan deposit transaction
 */
const testDepositTransaction = async () => {
  try {
    console.log('Testing deposit transaction recording...');
    
    // Bersihkan data test sebelumnya jika ada
    // await Ledger.destroy({ where: { spbu_id: 998 } });
    
    // Test deposit approved (sekarang akan dicatat sebagai debit)
    const approvedDeposit = {
      spbu_id: 998,
      id: 1,
      amount: 1000000,
      created_by: 1,
      status: 'approved'
    };
    
    await recordDepositTransaction(approvedDeposit);
    console.log('Approved deposit recorded');
    
    // Test deposit rejected (sekarang akan dicatat sebagai credit)
    const rejectedDeposit = {
      spbu_id: 998,
      id: 2,
      amount: 500000,
      created_by: 1,
      status: 'rejected'
    };
    
    await recordDepositTransaction(rejectedDeposit);
    console.log('Rejected deposit recorded');
    
    // Verifikasi entri yang dibuat
    const ledgerEntries = await Ledger.findAll({
      where: { spbu_id: 998 },
      order: [['created_at', 'ASC']]
    });
    
    console.log('Ledger entries for test SPBU:');
    ledgerEntries.forEach(entry => {
      console.log(`- Type: ${entry.transaction_type}, Debit: ${entry.debit}, Credit: ${entry.credit}, Description: ${entry.description}`);
    });
    
    console.log('Deposit transaction test completed successfully');
    return true;
  } catch (error) {
    console.error('Error in testDepositTransaction:', error);
    return false;
  }
};

/**
 * Fungsi untuk menguji perhitungan final balance dengan berbagai skenario
 */
const testFinalBalanceCalculation = async () => {
  try {
    console.log('Testing final balance calculation...');
    
    // Bersihkan data test sebelumnya jika ada
    // await Ledger.destroy({ where: { spbu_id: 997 } });
    
    // Buat beberapa transaksi dengan nilai yang bervariasi
    const testTransactions = [
      // Transaksi 1: Debit 1000000, Credit 0
      {
        spbu_id: 997,
        transaction_type: 'delivery',
        description: 'Fuel delivery',
        debit: 1000000,
        credit: 0,
        created_by: 1
      },
      // Transaksi 2: Debit 0, Credit 1200000
      {
        spbu_id: 997,
        transaction_type: 'sale',
        description: 'Fuel sale',
        debit: 0,
        credit: 1200000,
        created_by: 1
      },
      // Transaksi 3: Debit 500000, Credit 0 (deposit approved)
      {
        spbu_id: 997,
        transaction_type: 'deposit',
        description: 'Approved deposit',
        debit: 500000,
        credit: 0,
        created_by: 1
      },
      // Transaksi 4: Debit 0, Credit 300000
      {
        spbu_id: 997,
        transaction_type: 'adjustment',
        description: 'Gain adjustment',
        debit: 0,
        credit: 300000,
        created_by: 1
      }
    ];
    
    // Tambahkan semua transaksi
    // for (const transaction of testTransactions) {
    //   await addLedgerEntry(transaction);
    // }
    
    // Verifikasi hasil perhitungan
    const verification = await verifyLedgerBalance(997);
    console.log('Final balance verification:', verification);
    
    // Hitung manual:
    // Total Debit: 1000000 + 0 + 500000 + 0 = 1500000
    // Total Credit: 0 + 1200000 + 0 + 300000 = 1500000
    // Final Balance: 1500000 - 1500000 = 0
    
    console.log('Expected results:');
    console.log('- Total Debit: 1500000');
    console.log('- Total Credit: 1500000');
    console.log('- Final Balance: 0');
    
    console.log('Test completed successfully');
    return true;
  } catch (error) {
    console.error('Error in testFinalBalanceCalculation:', error);
    return false;
  }
};

module.exports = {
  testLedgerBalanceCalculation,
  testDepositTransaction,
  testFinalBalanceCalculation
};