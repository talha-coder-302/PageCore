const passport = require('passport');
const { isAdmin, authJWT } = require(`${__middelwares}/user`)

module.exports = (router, controller) => {
  router.use(passport.initialize());
  
  router.post('/createUser', authJWT, isAdmin, controller.createUser);
  router.post('/login', controller.login);
  router.post('/logout', controller.logout);
};