const fetch = require("node-fetch");

const BASE_URL = process.env.INVENTORY_SERVICE_BASE_URL;

async function getInventoryForProduct(productId) {
  try {
    const response = await fetch(`${BASE_URL}/api/inventory?upc=${productId}`);
    if (response.status === 404) {
      return {
        error: true,
        message: "Product not found",
      };
    }

    const payload = await response.json();

    if (response.status !== 200) {
      return {
        error: true,
        message: payload.message,
      };
    }

    return {
      error: false,
      quantity: payload.quantity,
    };
  } catch (error) {
    return {
      error: true,
      message: "Failed to get inventory",
    };
  }
}

module.exports = {
  getInventoryForProduct,
};
