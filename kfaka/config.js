import { Kafka } from "kafkajs";

class KafkaConfig {
  constructor() {
    this.kafka = new Kafka({
        clientId: "node-kafka",
        brokers: ["localhost:9092"],
        connectionTimeout: 5000,  // Increase the timeout (default is 3000ms)
        requestTimeout: 20000, 
    });
    this.producerInstance = this.kafka.producer();
    this.consumerInstance = this.kafka.consumer({ groupId: "test-group" }); // Renamed to consumerInstance to avoid conflict
  }

  // Producer method
  async producer(topic, messages) {
    try {
      await this.producerInstance.connect();
      await this.producerInstance.send({
        topic: topic,
        messages: messages,
      });
    } catch (error) {
      console.log("Error producing message:", error);
    } finally {
      await this.producerInstance.disconnect();
    }
  }

  // Consumer method
  async consume(topic, callback) { // Renamed method to avoid conflict
    try {
      await this.consumerInstance.connect();
      await this.consumerInstance.subscribe({ topic: topic, fromBeginning: true });
      await this.consumerInstance.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = message.value.toString();
          callback(value);
        },
      });
    } catch (err) {
      console.log("Error consuming message:", err);
    }
  }
}

export default KafkaConfig;
