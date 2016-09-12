'use strict';

const Redis = require('ioredis');
const kue = require('kue');

const getSentinels = (sentinelsString) => {
  return sentinelsString.split(',').map(each => {
    return {
      host: each.split(':')[0],
      port: each.split(':')[1]
    };
  });
};

exports.job = opt => {
  const redis = new Redis({
    sentinels: getSentinels(opt.redisSentinelForJQ),
    name: opt.redisSentinelNameForJQ
  });
  redis.select(opt.redisDBForSubJob);
  return redis;
};

exports.task = opt => {
  return kue.createQueue({
    prefix: opt.prefix || 'q',
    redis: {
      createClientFactory: () => {
        return new Redis({
          sentinels: getSentinels(opt.redisSentinelForJQ),
          name: opt.redisSentinelNameForJQ,
          db: opt.redisDBForJQ || 0
        });
      }
    }
  })
};