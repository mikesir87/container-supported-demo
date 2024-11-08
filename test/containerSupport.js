const {PostgreSqlContainer} = require("@testcontainers/postgresql");
const {KafkaContainer} = require("@testcontainers/kafka");
const path = require("path");

async function createAndBootstrapPostgresContainer() {
  const postgresContainer = await new PostgreSqlContainer()
    .withBindMounts([
      {
        source: path.join(__dirname, "../dev/db"),
        target: "/docker-entrypoint-initdb.d",
        readOnly: false,
      },
    ])
    .start();

  // Configure the pg library
  process.env.PGUSER = postgresContainer.getUsername();
  process.env.PGPASSWORD = postgresContainer.getPassword();
  process.env.PGHOST = postgresContainer.getHost();
  process.env.PGPORT = postgresContainer.getPort();
  process.env.PGDATABASE = postgresContainer.getDatabase();

  return postgresContainer;
}


async function createAndBootstrapKafkaContainer() {
  const kafkaContainer = await new KafkaContainer()
    .withKraft()
    .withExposedPorts(9093)
    .start();

  process.env.KAFKA_BOOTSTRAP_SERVERS = `${kafkaContainer.getHost()}:${kafkaContainer.getMappedPort(9093)}`;

  await kafkaContainer.exec("kafka-topics --create --topic products --partitions 1 --replication-factor 1 --bootstrap-server localhost:9092");

  // await (new Promise((resolve) => setTimeout(resolve, 1000)));

  return kafkaContainer;
}


module.exports = {
  createAndBootstrapPostgresContainer,
  createAndBootstrapKafkaContainer,
};