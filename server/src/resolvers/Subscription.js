module.exports = {
	chatting:{
	 async subscribe(_,{id},ctx,info){
           // if(!ctx.user || ctx.user.userId){
           // 	throw new Error('Unauthrized!');
           // }
           return await ctx.db.subscription.chat({
           	where:{
           		
           		node:{
           			id
           		}
           	},
           },
           info)
		}
	}
}