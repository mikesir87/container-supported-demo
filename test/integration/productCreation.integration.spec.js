const {
  createAndBootstrapPostgresContainer,
  createAndBootstrapKafkaContainer,
  createAndBootstrapLocalstackContainer,
} = require("./containerSupport");
const { KafkaConsumer } = require("./kafkaSupport");

describe("Product creation", () => {
  let postgresContainer, kafkaContainer, localstackContainer;
  let kafkaConsumer;
  let productService, publisherService;

  beforeAll(async () => {
    console.log("Starting containers");

    await Promise.all([
      createAndBootstrapPostgresContainer().then(
        (c) => (postgresContainer = c),
      ),
      createAndBootstrapKafkaContainer().then((c) => (kafkaContainer = c)),
      createAndBootstrapLocalstackContainer().then(
        (c) => (localstackContainer = c),
      ),
    ]);

    kafkaConsumer = await new KafkaConsumer();
  }, 120000); // Making this very long in case the images need to be pulled

  beforeAll(async () => {
    productService = require("../../src/services/ProductService");
    publisherService = require("../../src/services/PublisherService");
  });

  afterAll(async () => {
    await kafkaConsumer.disconnect();
  });

  afterAll(async () => {
    await productService.teardown();
    await publisherService.teardown();

    await Promise.all([
      postgresContainer.stop(),
      kafkaContainer.stop(),
      localstackContainer.stop(),
    ]);
  });

  it("should publish and return a product when creating a product", async () => {
    const product = await productService.createProduct({
      name: "Test Product",
      price: 100,
      upc: "100000000001",
    });

    expect(product.id).toBeDefined();
    expect(product.name).toBe("Test Product");
    expect(product.price).toBe(100);

    const retrievedProduct = await productService.getProductById(product.id);
    expect(retrievedProduct.id).toBe(product.id);
    expect(retrievedProduct.name).toBe(product.name);
    expect(retrievedProduct.inventory).toEqual({
      error: true,
      message: "Failed to get inventory",
    });
  });

  it("should publish a Kafka message when creating a product", async () => {
    createdProduct = await productService.createProduct({
      name: "Kafka publishing test",
      price: 100,
      upc: "100000000002",
    });

    expect(createdProduct.id).toBeDefined();
    expect(createdProduct.name).toBe("Kafka publishing test");
    expect(createdProduct.price).toBe(100);
    expect(createdProduct.upc).toBe("100000000002");

    await kafkaConsumer.waitForMessage({
      id: createdProduct.id,
      action: "product_created",
    });
  }, 15000);

  it("should upload a file correctly", async () => {
    createdProduct = await productService.uploadProductImage(
      "123",
      "test.jpg",
      Buffer.from("test"),
    );

    await kafkaConsumer.waitForMessage({
      action: "image_uploaded",
      product_id: "123",
      filename: "test.jpg",
    });
  }, 15000);

  it("doesn't allow duplicate UPCs", async () => {
    await productService.createProduct({
      name: "Kafka publishing test",
      price: 100,
      upc: "100000000003",
    });

    await expect(
      productService.createProduct({
        name: "Kafka publishing test",
        price: 100,
        upc: "100000000003",
      }),
    ).rejects.toThrow("Product with this UPC already exists");
  });
});
