require('dotenv').config();
const _ = require('underscore');
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV :'development';

process.on("uncaughtException",(err)=>{
    console.error("[Config]",err);
});

module.exports = _.extend(require('./env/core'),require(`./env/${process.env.NODE_ENV}`));
console.log(`------------------${process.env.NODE_ENV} environment---------------------`);

