const { PrismaClient } = require('@prisma/client');

function createPrismaClient(options) {
  return new PrismaClient(options);
}

module.exports = { createPrismaClient };