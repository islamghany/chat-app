import {
  Sidebar,
  InputGroup,
  Icon,
  Input,
  Divider,
  Button,
  Avatar,
} from "rsuite";
import { useQuery, gql } from "@apollo/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { openedChat } from "../../libs/withApollo";
import LoadingComponent from "../loading/LoadingComponent";
import { useEffect } from "react";
import { keyword } from "../../libs/withApollo";
const FILTER_CHAT = gql`
  query filterChats {
    filterChats @client
  }
`;

const GET_USER_CHAT = gql`
  query getChats {
    chats {
      id
      name
      text
      updatedAt
      unreadMessages
    }
  }
`;

const CHAT_SUBSCRIBTION = gql`
  subscription chat {
    chatting {
      node {
        id
        name
        text
        updatedAt
        unreadMessages
      }
    }
  }
`;
interface ChatInfo {
  name: string;
  id: string;
  updatedAt?: string;
  text: string;
  unreadMessages?: number | null;
}

interface Props {
  chats: ChatInfo[];
  subscribeToMore: any;
}
dayjs.extend(relativeTime);

const RenderChatItem = ({
  name,
  id,
  updatedAt,
  text,
  unreadMessages,
}: ChatInfo) => {
  let nameArr = name.split(" ");
  return (
    <Button
      className="p-none m-none chat__button"
      block
      onClick={() => {
        openedChat({ id, name });
      }}
    >
      <div className="chat__item">
        <div className="chat__img">
          <Avatar size="md" circle className="chat__avatar">
            {nameArr.length > 1
              ? nameArr[0][0] + nameArr[1][0]
              : name[0] + name[1]}
          </Avatar>
        </div>
        <div className="chat__info">
          <div className="chat__info__title">
            <div className="chat__info__name">
              <span>{name}</span>
            </div>
            {updatedAt && <span>{dayjs().from(dayjs(updatedAt))}</span>}
          </div>
          <div className="chat__info__des">
            <span>{text || ""}</span>
          </div>
        </div>
      </div>
    </Button>
  );
};

const List = ({ chats, subscribeToMore }: Props) => {
  const { data } = useQuery(FILTER_CHAT);
  useEffect(() => {
    subscribeToMore();
  }, []);
  const RenderItems = () => {
    let keyword = data.filterChats;
    if (keyword) keyword = keyword.trim();
    let filtedArr = chats.filter((item) =>
      item.name.includes(data.filterChats)
    );
    return filtedArr.map((chat: ChatInfo) => (
      <li key={chat.id}>
        <RenderChatItem
          name={chat.name}
          updatedAt={chat.updatedAt}
          id={chat.id}
          text={chat.text}
        />
        <Divider className="m-none" />
      </li>
    ));
  };
  return (
    <ul
      className="m-none p-none"
      style={{
        overflow: "auto",
      }}
    >
      {RenderItems()}
    </ul>
  );
};
const RenderChatList = ({ userId }: any) => {
  const { data, loading, error, subscribeToMore } = useQuery(GET_USER_CHAT);
  if (loading) return <LoadingComponent loading={true} />;
  if (data && data.chats) {
    return (
      <List
        chats={data.chats}
        subscribeToMore={() =>
          subscribeToMore({
            document: CHAT_SUBSCRIBTION,
            updateQuery: (prev, { subscriptionData }) => {
              if (!subscriptionData.data) return prev;
              const newChat = subscriptionData.data.chatting.node;
              let data = prev.chats;
              if (newChat.text) {
                data = data.filter((chat: ChatInfo) => chat.id !== newChat.id);
              }
              return Object.assign({}, prev, {
                chats: [newChat, ...data],
              });
            },
          })
        }
      />
    );
  }
  return null;
};

// const SearchChat = ()=>{

// }
const ChatSidebar = ({ userId }: any) => {
  return (
    <Sidebar className="sidebar">
      <div className="sidebar__search">
        <InputGroup inside size="lg">
          <Input placeholder="Search" onChange={(e) => keyword(e)} />
          <InputGroup.Button>
            <Icon icon="search" />
          </InputGroup.Button>
        </InputGroup>
      </div>
      <Divider className="m-none" />
      <div className="sidebar__users">
        <RenderChatList userId={userId} />
      </div>
    </Sidebar>
  );
};
export default ChatSidebar;
