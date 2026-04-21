/**
 * Kafka 消息队列工具
 * 版本: v1.0.0.0
 */

const { Kafka } = require('kafkajs');
const logger = require('../../../../src/open/api/utils/logger');

// Kafka 配置
const kafkaConfig = {
  clientId: 'user-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 3,
  },
};

// 创建 Kafka 客户端
const kafka = new Kafka(kafkaConfig);

// 生产者实例
let producer = null;

// 消费者实例
let consumer = null;

/**
 * 初始化 Kafka 生产者
 */
const initProducer = async () => {
  try {
    producer = kafka.producer();
    await producer.connect();
    logger.info('Kafka 生产者初始化成功');
  } catch (error) {
    logger.error('Kafka 生产者初始化失败:', error);
    throw error;
  }
};

/**
 * 初始化 Kafka 消费者
 * @param {string} groupId - 消费者组 ID
 * @param {Array} topics - 要消费的主题列表
 * @param {Function} messageHandler - 消息处理函数
 */
const initConsumer = async (groupId, topics, messageHandler) => {
  try {
    consumer = kafka.consumer({ groupId });
    await consumer.connect();

    // 订阅主题
    await consumer.subscribe({ topics, fromBeginning: false });

    // 开始消费
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value ? message.value.toString() : null;
          const key = message.key ? message.key.toString() : null;

          logger.info(`收到 Kafka 消息: topic=${topic}, key=${key}`);

          // 调用消息处理函数
          if (messageHandler) {
            await messageHandler({ topic, partition, message: { key, value } });
          }
        } catch (error) {
          logger.error('处理 Kafka 消息失败:', error);
        }
      },
    });

    logger.info('Kafka 消费者初始化成功');
  } catch (error) {
    logger.error('Kafka 消费者初始化失败:', error);
    throw error;
  }
};

/**
 * 发送消息到 Kafka
 * @param {string} topic - 主题名称
 * @param {Object} message - 消息内容
 * @param {string} key - 消息键
 */
const sendMessage = async (topic, message, key = null) => {
  try {
    if (!producer) {
      await initProducer();
    }

    const messages = [{
      key: key ? Buffer.from(key) : null,
      value: Buffer.from(JSON.stringify(message)),
    }];

    await producer.send({
      topic,
      messages,
    });

    logger.info(`消息发送成功: topic=${topic}, key=${key}`);
  } catch (error) {
    logger.error('发送消息失败:', error);
    throw error;
  }
};

/**
 * 关闭 Kafka 连接
 */
const closeKafka = async () => {
  try {
    if (producer) {
      await producer.disconnect();
      logger.info('Kafka 生产者已关闭');
    }

    if (consumer) {
      await consumer.disconnect();
      logger.info('Kafka 消费者已关闭');
    }
  } catch (error) {
    logger.error('关闭 Kafka 连接失败:', error);
  }
};

/**
 * 创建 Kafka 主题
 * @param {string} topic - 主题名称
 * @param {Object} options - 主题配置选项
 */
const createTopic = async (topic, options = {}) => {
  try {
    const admin = kafka.admin();
    await admin.connect();

    const topicConfig = [{
      topic,
      numPartitions: options.numPartitions || 1,
      replicationFactor: options.replicationFactor || 1,
    }];

    await admin.createTopics({ topics: topicConfig });
    await admin.disconnect();

    logger.info(`Kafka 主题创建成功: ${topic}`);
  } catch (error) {
    logger.error('创建 Kafka 主题失败:', error);
    throw error;
  }
};

/**
 * 列出所有 Kafka 主题
 */
const listTopics = async () => {
  try {
    const admin = kafka.admin();
    await admin.connect();

    const topics = await admin.listTopics();
    await admin.disconnect();

    logger.info('Kafka 主题列表:', topics);
    return topics;
  } catch (error) {
    logger.error('列出 Kafka 主题失败:', error);
    throw error;
  }
};

module.exports = {
  initProducer,
  initConsumer,
  sendMessage,
  closeKafka,
  createTopic,
  listTopics,
};
