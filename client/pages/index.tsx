import Navbar from '../components/chat/Navbar'
import { Container, Header} from 'rsuite';
import ChatContent from '../components/chat/ChatContent'
import ChatSidebar from '../components/chat/ChatSidebar'
import { removeCookie } from "../libs/auth";
import FriendDrawer from '../components/chat/Drawer'
import Router from "next/router";
import Loading from "../components/loading";
import {useEffect} from 'react';
import Head from '../components/Head'
const HomePage = ({data})=>{

    if(!data?.me?.name){
        Router.replace('login')
    }
    else if(data?.me?.name){
	return <Container>
  <Head title="Talklo" description="Talklo is a lightwight chat app, easy to send and recieve message with friends" />
	<Header>
      <Navbar me={data.me} />
    </Header>
    <FriendDrawer />
      <Container>
        <ChatSidebar 
        userId={data?.me?.id} 
        username={data?.me?.username} 
        />
        <ChatContent 
        userId={data?.me?.id} 
        username={data?.me?.username} 
        />
      </Container>
    </Container>
   }
   return <Loading loading={true} />
}




export default HomePage
