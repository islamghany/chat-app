const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const validator = require("validator");
const {AuthenticationError} = require('apollo-server-express')

require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
module.exports = {
  async signup(_, { email, name, password, username }, { db }, info) {
    // 1- check if the data is valid
    const errors = [];
    if (!name || !validator.isLength(name, { min: 6, max: 32 })) {
      errors.push(
        "Invalid name, Name must be not less than 6 chars and not more then 32 chars"
      );
    }
    if (!username || !validator.isLength(username, { min: 8, max: 32 })) {
      errors.push(
        "Invalid username, Username must be not less than 8 chars and not more then 32 chars"
      );
    }
    if (!email || !validator.isEmail(email)) {
      errors.push("Invalid email");
    }
    if (!password || !validator.isLength(password, { min: 6, max: 32 })) {
      errors.push(
        "Invalid password, Password must be not less than 6 chars and not more then 32 chars"
      );
    }
    if (errors.length) {
      throw new Error(errors[0]);
    }

    // 2- chaeck if the email or username is already exist
    let userExisted;
    try {
      userExisted = await db.exists.User({ email });
    } catch (err) {
      throw new Error("Signing up failed, please try again later.");
    }
    if (userExisted) {
      throw new Error("Email is already exist, Login instead.");
    }
    try {
      userExisted = await db.exists.User({ username });
    } catch (err) {
      throw new Error("Signing up failed, please try again later.");
    }
    if (userExisted) {
      throw new Error("Username is already taken, Try another one.");
    }
    // 3- put the data inside a token
    const token = jwt.sign(
      { email, name, password, username },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // 4- send an email with the token to the singup user to activate his account
    try {
      const emailDate = {
        from: "noreply@mernauth.com",
        to: email,
        subject: "Account activation link",
        html: `<h1>Please use the following link to activate your account</h1>
          <p>${process.env.CLIENT_URL}/activate-account/${token}</p>
          <hr />
          <p>this email may conatan sensitive information</p>
   	      <p>${process.env.CLIENT_URL}</p>
   	   `,
      };
      const sent = await sgMail.send(emailDate);
    } catch (err) {
      throw new Error(`Signing up failed, please try again later.`);
    }

    // 5- return a message with the email with success
    return { message: email };
  },
  async login(_, { email, password  }, { db }, info) {
    // 1- check if whether is email or username
    let isEmail;
    if (validator.isEmail(email)) {
      isEmail = true;
    }

    // 2- check existing of email
    let user;
    let where = isEmail ? { email } : { username: email };
    try {
      user = await db.query.user({
        where,
      });
    } catch (err) {
      throw new Error(`Signing in failed, please try again later.`);
    }

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    // 3- check if the password match
    let valid;
    try {
      valid = await bcrypt.compare(password, user.password);
    } catch (err) {
      throw new Error(`Signing in failed, please try again later.`);
    }
    if (!valid) {
      throw new Error(`Invalid Credentials`);
    }
    // -4 return the user and the token
    return {
      user,
      token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET),
    };
  },
  async forgetPassword(_, { email }, { db },info) {
    // 1- check if the email exist

    let user;
    try {
      user = await db.query.user({
        where: {
          email,
        },
      });
    } catch (err) {
      throw new Error("Unknowen error, please try again later.");
    }
    if (!user) {
      throw new Error(`No such user found for ${email}`);
    }
    // 2- send an email to user with the the token page to verify
    const token = jwt.sign(
        { id: user.id, email, name: user.name },
        process.env.JWT_SECRET,
        {
          expiresIn: "10m",
        }
      );
      const emailDate = {
        from: "noreply@mernauth.com",
        to: email,
        subject: "Password reset link",
        html: `<h1>Please use the following link to activate your account</h1>
          <p>${process.env.CLIENT_URL}/reset-password/${token}</p>
          <hr />
          <p>this email may conatan sensitive information</p>
   	      <p>${process.env.CLIENT_URL}</p>
   	   `,
      };
    try {
      const sent = await sgMail.send(emailDate);
      user.resetPasswordLink = token;
      let id = user.id;
      delete user.id;
      await db.mutation.updateUser(
        {
          data: user,
          where: { id },
        },
        info
      );
    } catch (err) {
      throw new Error("Unknowen error please try again later.");
    }
    return { message: email };
  },
  async resetPassword(_, { newPassword, resetPasswordLink }, { db }, info) {
    // 1- check if token is valid
    let decoded;
    try {
      decoded = jwt.verify(resetPasswordLink, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error(`Expired Link. try again later`);
    }
    if (!decoded) {
      throw new Error(`Expired Link. try again later`);
    }
    // 2- get the user by id in the decoded token
    let user;
    try {
      user = await db.query.user({
        where: {
          id: decoded.id,
        },
      });
    } catch (err) {
      throw new Error("Unknowen error please try again later.");
    }
    if (!user || user.resetPasswordLink != resetPasswordLink) {
      throw new Error("Something went wrong. Try later");
    }
    // 3- change the password and save it to database
    try {
      delete user.id;
      user.resetPasswordLink = "";
      user.password = await bcrypt.hash(newPassword, 10);
      await db.mutation.updateUser(
        {
          data: user,
          where: { id: decoded.id },
        },
     );
    } catch (err) {
      throw new Error(`Something went wrong. Try later`);
    }
    return { message: user.name };
  },




/******************chatting******************/


async createChat(_,{name,users},ctx,info){

  // 1-check if the user is authrized
  if(!ctx.user || !ctx.user.userId){
    throw new AuthenticationError('Unauthorized, You must be logged in to query this schema');
  }
  users.push(ctx.user.userId);
  
  const data = {
    name,
    users:{
      connect:users.map(id=>({
        id
      }))
    }
  };
  let chat;
  try{
    chat = await ctx.db.mutation.createChat({data},info)
  }catch(err){
    throw new Error('Something went wrong. Try later');
  }
  //  try{
  //     await Promise.all(
  //   users.map(async userID => {
  //     return await ctx.db.mutation.updateUser({
  //       where: {
  //         id: userID
  //       },
  //       data: {
  //         chats: {
  //           connect: {
  //             id: chat.id
  //           }
  //         }
  //       }
  //     }, info)
  //   })
  // )
  //  }catch(err){
  //     throw new Error('Something went wrong. Try later');
  //  }
   return chat;
 },
  async createMessage(_,{chatId,text},ctx,info){
   // 1-check if the user is authrized
  if(!ctx.user || !ctx.user.userId){
    throw new AuthenticationError('Unauthorized, You must be logged in to query this schema');
  }
    let messgae;
    const data = {
      text,
      state:'SENT',
      user:{
        connect:{
          id:ctx.user.userId
        },
      },
      chat:{
        connect:{
          id:chatId
        }
      }
    };
    try{
      message = await ctx.db.mutation.createMessage({data},info);
      await ctx.db.mutation.updateChat({
        data:{
          text:message.text,
          messages:{
            connect:{
              id:message.id
            }
          }
        },
        where:{
          id:chatId
        }
      });
    }catch(err){
      
      throw new Error('Something went wrong. Try later');      
    }
    return message;
  },
  async deleteMessage(_,{id},ctx,info){
    //1 check if the user  exist
     if(!ctx.user || !ctx.user.userId){
    throw new AuthenticationError('Unauthorized, You must be logged in to query this schema');
  }
  //console.log(info)
   // 2 check that the message have the same user id
    let message;
    try{
      message = await ctx.db.query.message({
        where:{
          id
        }
      },`
      {user{
              id
            }}
      `)
      
    }catch(err){
       throw new Error('Something went wrong. Try later'); 
    } 
    if(message.user.id !== ctx.user.userId){
          throw new AuthenticationError('Unauthorized!');
    }
    try{
      message = await ctx.db.mutation.updateMessage({
        data:{
          text:'DELETED',
          state:'DELETED'
        },
        where:{
          id
        }
      },info)
    }catch(err){
    }
    return message
  }

};
