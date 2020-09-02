import {
  Container,
  Content,
  Input,
  Button,
  Avatar,
  Divider,
  Whisper,
  Tooltip,
  Dropdown,
  IconButton,
  Icon,
} from "rsuite";
import { gql, useQuery, useMutation } from "@apollo/client";
import LoadingComonent from "../loading/LoadingComponent";
import ErrorMessage from "../ErrorMessgae";
import { CURRENT_USER } from "../User";
import { useRef, useEffect, useState, Fragment } from "react";

let skip: number = 0,
  count: number = 0,
  lastLen = 0,
  isSkiping = "BOTTOM";

const getMessageDate = (date: string) => {
  const x = new Date(date)
    .toLocaleTimeString()
    .toString()
    .split(/[\s:]+/);
  return x[0] + ":" + x[1] + " " + x[3];
};
const getDate = (d: string) => {
  if (new Date().toLocaleDateString() === new Date(d).toLocaleDateString())
    return "today";
  else if ((new Date().getTime() - new Date(d).getTime()) * 1000 * 3600 < 48)
    return "yesterday";
  return new Date(d).toDateString();
};
const compareDates = (x: string , y: string) => {
  return new Date(x).toLocaleDateString() !== new Date(y).toLocaleDateString();
};

const OPENEDCHAT = gql`
  query openedChat {
    openedChat @client {
      id
      name
    }
  }
`;
const GET_CHAT_MESSAGES = gql`
  query getChatMessages($id: ID!, $skip: Int) {
    messages(orderBy: createdAt_ASC, last: 20, skip: $skip, id: $id) {
      id
      text
      createdAt
      state
      user {
        id
        username
      }
    }
  }
`;
const CREATE_MESSAGE = gql`
  mutation createMessage($chatId: ID!, $text: String!) {
    createMessage(chatId: $chatId, text: $text) {
      id
      text
      createdAt
      state
      user {
        id
        username
      }
    }
  }
`;

const GET_CHAT_MESSAGE_COUNT = gql`
  query getChatMessagesCount($id: ID!) {
    messagesConnection(id: $id) {
      aggregate {
        count
      }
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription onMessageAdded($id: ID!) {
    message(id: $id) {
      node {
        id
        text
        createdAt
        state
        user {
          id
          username
        }
      }
    }
  }
`;
const DELETE_MESSAGE = gql`
  mutation deleteMessage($id: ID!) {
    deleteMessage(id: $id) {
      id
      text
      state
      user {
        id
        username
      }
    }
  }
`;
interface ChatInfo {
  id: string;
  username?: string;
  name?: string;
  userId?: string;
  messages?: Message[];
  subscribeToMore: any;
  fetchMore: any;
}
interface Message {
  id: string;
  text: string;
  createdAt: string;
  state: string;
  user: {
    id: string;
    username: string;
  };
}
interface Props {
  message: Message;
  userId?: string;
  diff?: boolean;
  deleteMessage?: any;
}

interface MessageProps {
  id: string;
  userId: string;
  messages: Message[];
  subscribeToMore: any;
  fetchMore: any;
}
let userId = "10";

const RenderMessage = ({ message, userId, diff, deleteMessage }: Props) => {
  let sender: boolean = userId === message.user.id;
  const menuRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="message">
      <div
        className={`message__${
          sender
            ? message.state === "DELETED"
              ? "sender __deleted"
              : "sender"
            : message.state === "DELETED"
            ? "reciever __deleted"
            : "reciever"
        }`}
      >
        <div className="message__reciever__img">
          {diff && userId !== message.user.id ? (
            <Whisper
              placement="rightStart"
              trigger="hover"
              speaker={<Tooltip>{message.user.username}</Tooltip>}
            >
              <Avatar className="message__avatar" size="md" circle>
                {message.user.username[0] + message.user.username[1]}
              </Avatar>
            </Whisper>
          ) : null}
        </div>
        {message.state !== "DELETED" && userId === message.user.id && (
          <div ref={menuRef} className="message__menu">
            <Dropdown
              onOpen={() => {
                if (menuRef?.current) menuRef.current.style.display = "block";
              }}
              onClose={() => {
                if (menuRef?.current) menuRef.current.style.display = "none";
              }}
              renderTitle={() => {
                return (
                  <IconButton
                    appearance="default"
                    icon={<Icon icon="ellipsis-h" />}
                  />
                );
              }}
            >
              <Dropdown.Item
                onSelect={() =>
                  deleteMessage({ variables: { id: message.id } })
                }
              >
                <Icon icon="trash-o" /> Delete
              </Dropdown.Item>
            </Dropdown>
          </div>
        )}
        <div
          className={`message__container ${
            diff && userId !== message.user.id ? "bordred" : ""
          }`}
        >
          <span className="message__text">
            {message.state === "DELETED"
              ? userId === message.user.id
                ? "You have deleted this message"
                : "This message has been deleted"
              : message.text}
          </span>
          {message.state !== "DELETED" && (
            <div className="message__tail">
              <span className="time">{getMessageDate(message.createdAt)}</span>
              {userId === message.user.id && <span>{message.state}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
let len: boolean = false;

const Messages = ({
  id,
  userId,
  messages,
  fetchMore,
  subscribeToMore,
}: MessageProps) => {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    ignoreResults: true,
  });
  let lastDate: string ='';
  let LID: string | null = null;
  const [lastFetchDataLength, setLastFetchDataLength] = useState(0);
  const [lastHeight, setLastHeight] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const handleScroll = () => {
    if (
      bodyRef &&
      bodyRef.current &&
      bodyRef.current.scrollTop < 50 &&
      messages.length >= 10 &&
      count > messages.length &&
      lastFetchDataLength !== messages.length
    ) {
      setLastFetchDataLength(messages.length);
      setLastHeight(bodyRef.current.scrollHeight);
      fetchMore({
        variables: {
          id,
          skip: messages.length,
        },
        updateQuery: (prev:any, { fetchMoreResult }:any) => {
          isSkiping = "SAME";
          if (!fetchMoreResult) return prev;
          return Object.assign({}, prev, {
            messages: [...fetchMoreResult.messages, ...prev.messages],
          });
        },
      });
    }
  };
  useEffect(() => {
    if (messages.length <= 20 && bodyRef && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      len = true;
      lastLen = messages.length;
      return;
    }

    if (bodyRef && bodyRef.current) {
      if (isSkiping === "SAME") {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight - lastHeight;
      } else if (isSkiping === "BOTTOM")
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      else if (
        isSkiping === "DONT" &&
        bodyRef.current.scrollHeight -
          bodyRef.current.scrollTop -
          bodyRef.current.offsetHeight <
          200
      )
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
    lastLen = messages.length;
  }, [messages.length]);
  useEffect(() => {
    subscribeToMore();
  }, []);
  return (
    <div
      className="chat__body__container"
      ref={bodyRef}
      onScroll={handleScroll}
    >
      {messages.map((message: Message, idx: number) => {
        let diff: boolean = false;
        if (idx === 0) lastDate = message.createdAt;
        else if (idx !== 0 && compareDates(lastDate, message.createdAt))
          lastDate = message.createdAt;
        if (!LID && userId !== message.user.id) LID = message.user.id;
        if (messages.length - 1 === idx || messages[idx + 1].user.id !== LID) {
          LID = null;
          diff = true;
        }
        return (
          <Fragment key={message.id}>
            {(idx === 0 || lastDate === message.createdAt) && (
              <Divider>{getDate(message.createdAt)}</Divider>
            )}
            <RenderMessage
              message={message}
              userId={userId}
              key={message.id}
              diff={diff}
              deleteMessage={deleteMessage}
            />
          </Fragment>
        );
      })}
    </div>
  );
};
const RenderChatMessages = ({ id, userId }: any) => {
  const { data, loading, error, fetchMore, subscribeToMore } = useQuery(
    GET_CHAT_MESSAGES,
    {
      //skip:isSkiping,
      variables: { id, skip },
      notifyOnNetworkStatusChange: true,
    }
  );

  if (error) return <ErrorMessage error={error} />;
  if (loading && !data?.messages) return <LoadingComonent loading={true} />;
  if (data?.messages) {
    return (
      <div>
        {loading && (
          <div className="chat__loading">
            <LoadingComonent loading={true} />
          </div>
        )}
        <Messages
          id={id}
          userId={userId}
          fetchMore={fetchMore}
          messages={data.messages}
          subscribeToMore={() =>
            subscribeToMore({
              document: MESSAGE_SUBSCRIPTION,
              variables: { id },
              updateQuery: (prev, { subscriptionData }) => {
                isSkiping = "DONT";
                if (
                  !subscriptionData.data ||
                  subscriptionData?.data?.message.node?.user?.id === userId
                )
                  return prev;
                const newMessage = subscriptionData.data.message.node;
                return Object.assign({}, prev, {
                  messages: [...prev.messages, newMessage],
                });
              },
            })
          }
        />
      </div>
    );
  }
  return null;
};
const RenderChatHeader = ({ id, name }: any) => {
  return (
    <div>
      <div className="chat__item">
        <div className="chat__img">
          <Avatar size="md" circle className="chat__avatar">
            {name[0] + name[1]}
          </Avatar>
        </div>
        <div className="chat__info">
          <div className="chat__info__title">
            <div className="chat__info__name">
              <span>{name}</span>
            </div>
          </div>
          {null && (
            <div className="chat__info__des">
              <span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatSender = ({ userId, id, username }: any) => {
  const senderRef = useRef<HTMLInputElement | null>(null);
  const [createMessage, { data }] = useMutation(CREATE_MESSAGE);
  const onSubmit = (e: any) => {
    e.preventDefault();

    if (senderRef?.current?.value.trim().length) {
      isSkiping = "BOTTOM";
      createMessage({
        variables: { chatId: id, text: senderRef?.current?.value },
        optimisticResponse: {
          __typename: "Mutation",
          createMessage: {
            __typename: "Message",
            id: new Date().toISOString(),
            state: "Send",
            text: senderRef?.current?.value,
            createdAt: new Date().toISOString(),
            user: {
              id: userId,
              username: username,
              __typename: "User",
            },
          },
        },

        update: (proxy, { data: { createMessage } }: any) => {
          count += 1;
          try {
            const data: any = proxy.readQuery({
              query: GET_CHAT_MESSAGES,
              variables: { id, skip },
            });
            proxy.writeQuery({
              query: GET_CHAT_MESSAGES,
              variables: { id, skip },
              data: {
                ...data,
                messages: [...data.messages, createMessage],
              },
            });
          } catch (error) {}
        },
      });
      senderRef.current.value = "";
    }
  };
  return (
    <div className="chat__sender">
      <div className="chat__attachment"></div>
      <div className="chat__input">
        <form className="chat__form" onSubmit={onSubmit}>
          <Input
            inputRef={senderRef}
            size="lg"
            placeholder="write something.."
          />
          <Button size="lg" appearance="primary" type="submit">
            send
          </Button>
        </form>
      </div>
    </div>
  );
};

const Chat = ({ id, userId, name, username }: any) => {
  const { data, loading, error } = useQuery(GET_CHAT_MESSAGE_COUNT, {
    variables: { id },
  });
  if (error) return <ErrorMessage error={error} />;
  if (loading) return <LoadingComonent loading={true} />;
  if (data?.messagesConnection) {
    count = data?.messagesConnection.aggregate.count;
    return (
      <div className="chat">
        <RenderChatHeader id={id} name={name} />
        <Divider className="m-none" />
        <div className="chat__body">
          <RenderChatMessages userId={userId} id={id} />
        </div>
        <Divider className="m-none" />
        <ChatSender username={username} id={id} userId={userId} />
      </div>
    );
  }
  return null;
};
const ChatContent = ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  const { data } = useQuery(OPENEDCHAT);
  skip = 0;
  isSkiping = "BOTTOM";
  if (data?.openedChat?.id) {
    const { id, name } = data.openedChat;
    return <Chat id={id} name={name} userId={userId} username={username} />;
  }
  return (
    <div className="content__intro">
      <img src="/undraw_work_chat_erdt.svg" width="50%" />
      <h1 className="heading">Talklo</h1>
      <h6>help you to connect with your firends</h6>
    </div>
  );
};
const MainContent = ({ username, userId }: any) => {
  // const { data } = useQuery(CURRENT_USER);
  return (
    <Content className="content">
      <ChatContent userId={userId} username={username} />
    </Content>
  );
};
export default MainContent;
