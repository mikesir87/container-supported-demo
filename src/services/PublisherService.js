const { Kafka, Partitioners } = require('kafkajs')

let producer;

async function getProducer() {
  if (producer) {
    return producer;
  }

  const BROKER_URLS = (process.env.KAFKA_BOOTSTRAP_SERVERS || "localhost:9092").split(",");

  const kafka = new Kafka({
    clientId: 'catalog-service',
    brokers: BROKER_URLS
  });
  
  producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  await producer.connect();
  return producer;
}

async function teardown() {
  if (producer) {
    await producer.disconnect();
  }
}

async function publishEvent(topic, event) {
  const producer = await getProducer();

  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(event) }
    ]
  });
}

module.exports = {
  publishEvent,
  teardown,
};
