/**
 * MIXMLAAL Transaction Service
 * 版本: v1.0.0.0
 * 说明: 分布式事务协调服务，确保数据一致性
 */

const express = require('express');
const { Kafka } = require('kafka-node');
const redis = require('redis');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.TRANSACTION_SERVICE_PORT || 3011;

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 数据库连接
let db;

// Redis连接
let redisClient;

// Kafka连接
let kafkaClient;
let producer;
let consumer;

// 事务状态
const transactionStatus = {
  PENDING: 'pending',
  COMMITTED: 'committed',
  ROLLBACK: 'rollback',
  COMPLETED: 'completed',
  TIMED_OUT: 'timed_out',
};

// 事务超时时间（毫秒）
const TRANSACTION_TIMEOUT = 300000; // 5分钟

// 初始化数据库
const initDatabase = async () => {
  try {
    db = await mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'mixmlaal',
      password: process.env.MYSQL_PASSWORD || 'mixmlaal',
      database: process.env.MYSQL_DATABASE || 'mixmlaal',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // 创建事务表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        transactionId VARCHAR(50) UNIQUE,
        status VARCHAR(20),
        createdAt DATETIME,
        updatedAt DATETIME
      )
    `);

    // 创建事务步骤表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transaction_steps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        transactionId VARCHAR(50),
        service VARCHAR(50),
        action VARCHAR(50),
        status VARCHAR(20),
        data JSON,
        createdAt DATETIME,
        updatedAt DATETIME,
        FOREIGN KEY (transactionId) REFERENCES transactions(transactionId)
      )
    `);

    // Database initialized successfully
  } catch (error) {
    // Database initialization failed
  }
};

// 初始化Redis
const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'redis',
      port: process.env.REDIS_PORT || 6379,
    });

    await redisClient.connect();
    // Redis initialized successfully
  } catch (error) {
    // Redis initialization failed
  }
};

// 初始化Kafka
const initKafka = async () => {
  try {
    kafkaClient = new Kafka.KafkaClient({
      kafkaHost: `${process.env.KAFKA_HOST || 'kafka'}:${process.env.KAFKA_PORT || 9092}`,
    });

    producer = new Kafka.Producer(kafkaClient);
    consumer = new Kafka.Consumer(
      kafkaClient,
      [
        { topic: 'transaction-events', partition: 0 },
        { topic: 'service-events', partition: 0 },
      ],
      {
        autoCommit: true,
      },
    );

    producer.on('ready', () => {
      // Kafka Producer initialized successfully
    });

    producer.on('error', _error => {
      // Kafka Producer error
    });

    consumer.on('message', async message => {
      await handleKafkaMessage(message);
    });

    consumer.on('error', _error => {
      // Kafka Consumer error
    });

    // Kafka initialized successfully
  } catch (error) {
    // Kafka initialization failed
  }
};

// 处理Kafka消息
const handleKafkaMessage = async message => {
  try {
    const data = JSON.parse(message.value);

    switch (message.topic) {
      case 'transaction-events':
        await handleTransactionEvent(data);
        break;
      case 'service-events':
        await handleServiceEvent(data);
        break;
      default:
        // Unknown message type
    }
  } catch (error) {
    // Failed to handle Kafka message
  }
};

// 处理事务事件
const handleTransactionEvent = async event => {
  try {
    const { transactionId, eventType, data } = event;

    switch (eventType) {
      case 'transaction-started':
        await createTransaction(transactionId, data);
        break;
      case 'step-completed':
        await updateStepStatus(transactionId, data.service, transactionStatus.COMPLETED);
        await checkTransactionCompletion(transactionId);
        break;
      case 'step-failed':
        await updateStepStatus(transactionId, data.service, transactionStatus.ROLLBACK);
        await rollbackTransaction(transactionId);
        break;
      default:
        // Unknown transaction event type
    }
  } catch (error) {
    // Failed to handle transaction event
  }
};

// 处理服务事件
const handleServiceEvent = async event => {
  try {
    const { service: _service, eventType: _eventType, data: _data } = event;

    // 处理服务事件，如服务上线、下线等
    // Service event received
  } catch (error) {
    // Failed to handle service event
  }
};

// 创建事务
const createTransaction = async (transactionId, data) => {
  try {
    const now = new Date().toISOString();
    await db.execute(
      'INSERT INTO transactions (transactionId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
      [transactionId, transactionStatus.PENDING, now, now],
    );

    // 创建事务步骤
    if (data.steps) {
      for (const step of data.steps) {
        await db.execute(
          'INSERT INTO transaction_steps (transactionId, service, action, status, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [transactionId, step.service, step.action, transactionStatus.PENDING, JSON.stringify(step.data), now, now],
        );
      }
    }

    // Transaction created successfully
  } catch (error) {
    // Failed to create transaction
  }
};

// 更新步骤状态
const updateStepStatus = async (transactionId, service, status) => {
  try {
    const now = new Date().toISOString();
    await db.execute(
      'UPDATE transaction_steps SET status = ?, updatedAt = ? WHERE transactionId = ? AND service = ?',
      [status, now, transactionId, service],
    );
  } catch (error) {
    // Failed to update step status
  }
};

// 检查事务完成情况
const checkTransactionCompletion = async transactionId => {
  try {
    const [steps] = await db.execute(
      'SELECT * FROM transaction_steps WHERE transactionId = ?',
      [transactionId],
    );

    const allCompleted = steps.every(step => step.status === transactionStatus.COMPLETED);
    if (allCompleted) {
      await db.execute(
        'UPDATE transactions SET status = ?, updatedAt = ? WHERE transactionId = ?',
        [transactionStatus.COMMITTED, new Date().toISOString(), transactionId],
      );

      // 发送事务完成事件
      await sendKafkaMessage('transaction-events', {
        transactionId,
        eventType: 'transaction-completed',
        timestamp: new Date().toISOString(),
      });

      // Transaction completed
    }
  } catch (error) {
    // Failed to check transaction completion
  }
};

// 回滚事务
const rollbackTransaction = async transactionId => {
  try {
    const now = new Date().toISOString();
    await db.execute(
      'UPDATE transactions SET status = ?, updatedAt = ? WHERE transactionId = ?',
      [transactionStatus.ROLLBACK, now, transactionId],
    );

    // 发送事务回滚事件
    await sendKafkaMessage('transaction-events', {
      transactionId,
      eventType: 'transaction-rolled-back',
      timestamp: now,
    });

    // Transaction rolled back
  } catch (error) {
    // Failed to rollback transaction
  }
};

// 发送Kafka消息
const sendKafkaMessage = async (topic, message) => {
  return new Promise((resolve, reject) => {
    producer.send([{
      topic,
      messages: JSON.stringify(message),
    }], (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

// 路由配置
app.get('/health', async (req, res) => {
  res.json({
    status: 'success',
    message: 'Transaction Service is healthy',
  });
});

// 创建事务
app.post('/api/v1/transaction/create', async (req, res) => {
  try {
    const { transactionId, steps } = req.body;

    if (!transactionId || !steps || !Array.isArray(steps)) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }

    // 创建事务
    await createTransaction(transactionId, { steps });

    // 发送事务开始事件
    await sendKafkaMessage('transaction-events', {
      transactionId,
      eventType: 'transaction-started',
      data: { steps },
      timestamp: new Date().toISOString(),
    });

    res.json({
      status: 'success',
      message: '事务创建成功',
      data: { transactionId },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '创建事务失败',
      error: error.message,
    });
  }
});

// 获取事务状态
app.get('/api/v1/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const [transaction] = await db.execute(
      'SELECT * FROM transactions WHERE transactionId = ?',
      [transactionId],
    );

    if (transaction.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '事务不存在',
      });
    }

    const [steps] = await db.execute(
      'SELECT * FROM transaction_steps WHERE transactionId = ?',
      [transactionId],
    );

    res.json({
      status: 'success',
      data: {
        transaction: transaction[0],
        steps,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取事务状态失败',
      error: error.message,
    });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '接口不存在',
  });
});

// 错误处理
app.use((err, req, res, _next) => {
  // Transaction Service Error
  res.status(500).json({
    status: 'error',
    message: '服务内部错误',
  });
});

// 检查事务超时
const checkTransactionTimeouts = async () => {
  try {
    const now = new Date().toISOString();
    const timeoutThreshold = new Date(Date.now() - TRANSACTION_TIMEOUT).toISOString();
    
    // 查找超时的事务
    const [transactions] = await db.execute(
      'SELECT * FROM transactions WHERE status = ? AND createdAt < ?',
      [transactionStatus.PENDING, timeoutThreshold]
    );
    
    for (const transaction of transactions) {
      // 更新事务状态为超时
      await db.execute(
        'UPDATE transactions SET status = ?, updatedAt = ? WHERE transactionId = ?',
        [transactionStatus.TIMED_OUT, now, transaction.transactionId]
      );
      
      // 发送事务超时事件
      await sendKafkaMessage('transaction-events', {
        transactionId: transaction.transactionId,
        eventType: 'transaction-timed-out',
        timestamp: now,
      });
      
      // 回滚事务
      await rollbackTransaction(transaction.transactionId);
    }
  } catch (error) {
    // Failed to check transaction timeouts
  }
};

// 启动服务
const startServer = async () => {
  try {
    await initDatabase();
    await initRedis();
    await initKafka();

    // 定期检查事务超时
    setInterval(checkTransactionTimeouts, 60000); // 每分钟检查一次

    app.listen(PORT, '0.0.0.0', () => {
      // Transaction Service running
      // Health check available
    });
  } catch (error) {
    // Failed to start server
  }
};

startServer();

module.exports = app;
