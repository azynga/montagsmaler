// Authentication middleware
const isLoggedIn = (req, res, next) =>{
  
    const route = req.route.path;
    if(!req.session.currentUser){

      if(route === '/' || route === '/signup' || route === '/login') {
        next();
      } else {
        res.redirect('/auth/login');
      };

    } else {

      if(route === '/signup' || route === '/login') {
        res.redirect('/user/myaccount');
      } else {
        next();
      };

    };
};
  
  module.exports = {
    isLoggedIn
  };