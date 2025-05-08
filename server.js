require('./app-global');
const config = require(`${__config}/config`),
  app = require(`${__config}/express`),
  
 server = require('http').Server(app);
//import db 
require(`${__config}/dbConn`);

app.get('/', (req, res) => {
  res.send('Welcome to PageCore');
})

server.listen(`${config.port}`);
console.log(`Server is listing on port ${config.port}`);

module.exports = server;