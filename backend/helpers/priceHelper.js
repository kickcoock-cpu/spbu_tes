const { Price } = require('../models');

/**
 * Get the current price for a specific fuel type in a specific SPBU
 * @param {string} fuelType - The fuel type to get the price for
 * @param {number} spbuId - The SPBU ID to get the price for
 * @returns {Promise<number>} - The current price for the fuel type
 */
const getCurrentPriceForFuelType = async (fuelType, spbuId) => {
  try {
    // First, try to find a specific price for this SPBU
    const spbuPrice = await Price.findOne({
      where: {
        fuel_type: fuelType,
        spbu_id: spbuId
      },
      order: [['effective_date', 'DESC'], ['created_at', 'DESC']]
    });

    if (spbuPrice) {
      return parseFloat(spbuPrice.price);
    }

    // If no SPBU-specific price, try to find a global price
    const globalPrice = await Price.findOne({
      where: {
        fuel_type: fuelType,
        spbu_id: null
      },
      order: [['effective_date', 'DESC'], ['created_at', 'DESC']]
    });

    if (globalPrice) {
      return parseFloat(globalPrice.price);
    }

    // If no price found, return 0
    return 0;
  } catch (error) {
    console.error('Error getting current price for fuel type:', error);
    return 0;
  }
};

/**
 * Get all current prices for all fuel types in a specific SPBU
 * @param {number} spbuId - The SPBU ID to get prices for
 * @returns {Promise<Object>} - Object with fuel types as keys and prices as values
 */
const getCurrentPricesForSPBU = async (spbuId) => {
  try {
    const fuelTypes = ['Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'];
    const prices = {};

    for (const fuelType of fuelTypes) {
      prices[fuelType] = await getCurrentPriceForFuelType(fuelType, spbuId);
    }

    return prices;
  } catch (error) {
    console.error('Error getting current prices for SPBU:', error);
    return {};
  }
};

module.exports = {
  getCurrentPriceForFuelType,
  getCurrentPricesForSPBU
};