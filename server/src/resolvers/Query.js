  
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {AuthenticationError} = require('apollo-server-express')

module.exports = {
	users:(_,args,ctx)=>{
		return ctx.db.query.users({});
	},
  async me(_,args,ctx,info){
    const {user} = ctx;
    if(!user || !user.userId){
      throw new AuthenticationError('Unauthorized, You must be logged in to query this schema');
    }
    let existedUser;
    try{
      existedUser = await ctx.db.query.user({
        where:{
          id:user.userId
        }
      })
    }catch(err){
      console.log('unknowen error')
    }
    return existedUser;
  },
	async activateAccount(_,{token},{db},info){
  	  // 1- check if the token not expired 
  	  let decodedToken;
  	  try{
  	  	decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  	  }catch(err){
  	  	throw new Error(`Expired Link. Signup again`);
  	  }
  	  if(!decodedToken){
  	  	throw new Error(`Expired Link. Signup again1`);
  	  }

  	  // 2- hash the password and save it all in db
      let password;
  	  try{
  	  	 password = await bcrypt.hash(decodedToken.password,10);
  	  }catch(err){
  	  	throw new Error(`Unknowen Error, Please Try again later`);
  	  }
  	  let user;
      const {email,username,name} = decodedToken;
  	  try{
  	  	  user =await db.mutation.createUser({
  	  		data:{
  	  			email,
  	  			username,
  	  			password,
  	  			name
  	  		},
  	  	},info)
  	  }catch(err){
          throw new Error(`Unknowen Error, Please Try again later`);
  	  }
      return { message: decodedToken.name }; 
  },
  async isTokenTrue(_, { token }, ctx, info) {
    //console.log()
    let user,decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await ctx.db.exists.User({id:decoded.userId});
    } catch (err) {
      throw new Error(`Invalid Token, Please Signup instead`);
    }
    if (!user) {
      throw new Error(`Invalid Token, Please Signup instead`);
    }
    return { message: decoded.name || 'islam' };
  },

}