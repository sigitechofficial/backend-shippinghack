'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// config/config.json is intentionally git-ignored and is NOT present on
// production/staging servers, where DB settings come from environment
// variables (DB_HOST/DB_NAME/... or DATABASE_URL). Load it best-effort so a
// missing file never crashes the app; it is only needed for local dev and the
// Sequelize CLI. See config/config.json.example.
let fileConfig = {};
try {
  const allConfig = require(__dirname + '/../config/config.json');
  fileConfig = allConfig[env] || allConfig['development'] || {};
} catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    fileConfig = {};
  } else {
    throw e;
  }
}
const config = fileConfig;
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else if (process.env.DB_HOST) {
  sequelize = new Sequelize(
    process.env.DB_NAME || config.database,
    process.env.DB_USER || config.username,
    process.env.DB_PASSWORD || config.password,
    {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || config.port || 3306,
      dialect: config.dialect || 'mysql',
      dialectOptions: config.dialectOptions || {},
      logging: config.logging !== undefined ? config.logging : false,
      pool: config.pool || { max: 10, min: 2, acquire: 30000, idle: 10000 },
    }
  );
} else if (config.database) {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
} else {
  throw new Error(
    'Database configuration missing: set DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD ' +
    'environment variables, or provide config/config.json (see config/config.json.example).'
  );
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
