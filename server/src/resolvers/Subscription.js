module.exports = {
	chatting:{
	 async subscribe(_,{id},ctx,info){
           if(!ctx.user || ctx.user.userId){
           	throw new Error('Unauthrized!');
           }
           return await ctx.db.subscription.chat({
           	where:{
           		
           		node:{
           			users_some:{
                   id:ctx.user.userId
                 }
           		}
           	},
           },
           info)
		}
	},
  message:{
    async subscribe(_,{id},ctx,info){
      if(!ctx.user || ctx.user.userId){
             throw new Error('Unauthrized!');
           }
           return await ctx.db.subscription.message({
             where:{
               
               node:{
                 chat:{
                   id
                 }
               }
             },
           },
           info)
    }
  }
}