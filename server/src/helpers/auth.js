const jwt = require('jsonwebtoken');
const db = require('../db');

 const validateToken = (token,secret) => {
  let decodedToken;
  try {
  	 token = token.replace('Bearer ', '')
    decodedToken = jwt.verify(token,secret) 
  } catch (error) {}
  return decodedToken;
};

 const validateTokenAndSeeUser = async (token,secret) => {
  try {
    const decodedToken = validateToken(token,secret);
    if (decodedToken) {
      const user = await db.exists.User({ id: decodedToken.userId  });
      return user ? decodedToken : null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
	validateTokenAndSeeUser,
	validateToken
}
