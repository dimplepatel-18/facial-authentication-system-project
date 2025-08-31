const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('login_look', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => console.log('✅ MySQL Connected'))
    .catch(err => console.error('❌ Database Connection Failed:', err));

module.exports = sequelize;
