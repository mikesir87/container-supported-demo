const fetch = require("node-fetch");
jest.mock("node-fetch", () => jest.fn());

describe("InventoryService", () => {
  const {
    getInventoryForProduct,
  } = require("../../src/services/InventoryService");

  it("should return an error when the product is not found", async () => {
    fetch.mockResolvedValueOnce({ status: 404 });

    const result = await getInventoryForProduct(100000000001);

    expect(result).toEqual({
      error: true,
      message: "Product not found",
    });
  });

  it("should return an error when the response is not 200", async () => {
    fetch.mockResolvedValueOnce({
      status: 500,
      json: jest.fn().mockResolvedValueOnce({ message: "Some error" }),
    });

    const result = await getInventoryForProduct(100000000001);

    expect(result).toEqual({
      error: true,
      message: "Some error",
    });
  });

  it("should return an error when the request fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    const result = await getInventoryForProduct(100000000001);

    expect(result).toEqual({
      error: true,
      message: "Failed to get inventory",
    });
  });

  it("should return the quantity when the request is successful", async () => {
    fetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValueOnce({ quantity: 10 }),
    });

    const result = await getInventoryForProduct(100000000001);

    expect(result).toEqual({
      error: false,
      quantity: 10,
    });
  });
});
