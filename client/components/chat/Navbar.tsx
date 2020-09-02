import {
  Navbar,
  Nav,
  Icon,
  Dropdown,
  Button,
  Badge,
  IconButton,
  Modal,
  Input,
  Notification,
} from "rsuite";
import { CURRENT_USER } from "../User";
import { useLazyQuery, gql, useQuery, useMutation } from "@apollo/client";
import { removeCookie } from "../../libs/auth";
import { client, isDrawerOpen, isModalOpen } from "../../libs/withApollo";
import { useState } from "react";
import { GET_USERS } from "./Drawer";
import AsyncSelect from "react-select/async";
import Loading from "../loading";
const primary = "#3f51b5",
  second = "#f2f5ff";
const colourStyles = {
  control: (styles: any) => ({
    ...styles,
    color: "red",
    backgroundColor: "#fff",
    fontSize: "16px",
    minHeight: "42px",
    ":hover": {
      borderColor: primary,
    },
    ":active": {
      borderColor: primary,
    },
  }),
  option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
    return {
      ...styles,
      backgroundColor: isSelected ? primary : "#fff",
      color: isSelected ? "#fff" : "#575757",
      fontSize: "15px",
      ":active": {
        ...styles[":active"],
        backgroundColor: isSelected ? primary : "#fff",
      },
      ":hover": {
        ...styles[":hover"],
        backgroundColor: primary,
        color: "#fff",
      },
    };
  },
  multiValue: (styles: any, { data }: any) => {
    return {
      ...styles,
      backgroundColor: second,
    };
  },
  multiValueLabel: (styles: any, { data }: any) => ({
    ...styles,
    color: "#575757",
  }),
  input: (styles: any) => ({ ...styles, color: "#fff" }),

  multiValueRemove: (styles: any, { data }: any) => ({
    ...styles,
    backgroundColor: "#ff3860",
    color: "white",
  }),
};

interface Props {
  me: Me;
}
interface Me {
  name: string;
  username: string;
  email: string;
  id: string;
}
const IS_MODAL_OPEN = gql`
  query isModalOpen {
    isModalOpen @client
  }
`;

const ADD_CHAT = gql`
  mutation addChat($name: String!, $users: [ID!]!) {
    createChat(name: $name, users: $users) {
      id
      name
      users {
        id
      }
    }
  }
`;

function openNav(title: string) {
  Notification["success"]({
    title: "Chat Created",
    description: `${title} has been added successfuly`,
  });
}
let timer: any;
const CreateChatForm = ({ close }: any) => {
  const [chatName, setChatName] = useState<string>("");
  const [members, setMembers] = useState<any>([]);
  const [membersError, setMembersError] = useState<boolean>(false);
  const [chatNameError, setChatNameError] = useState<boolean>(false);
  const [addChat, { data, loading, error }] = useMutation(ADD_CHAT, {
    onCompleted: () => {
      openNav(chatName);
      isModalOpen(false);
    },
  });
  const promiseOptions = async (inputValue: string) => {
    const res = await client.query({
      query: GET_USERS,
      variables: { keyword: inputValue },
    });

    if (res.data && res.data.users) {
      return res.data.users.map((a: { id: string; username: string }) => ({
        label: a.username,
        value: a.id,
      }));
    }

    return [];
  };

  const onChange = (selectedOptions: any) => {
    setMembers(
      selectedOptions && selectedOptions.length
        ? selectedOptions.map((e: any) => e.value)
        : []
    );
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!members || !members.length) {
      setMembersError(true);
      return;
    }
    if (!chatName || !chatName.trim().length) {
      setChatNameError(true);
      return;
    } else {
      addChat({ variables: { name: chatName, users: members } });
      setMembersError(false);
      setChatNameError(false);
    }
  };
  return (
    <div className="">
      <Loading loading={loading} />
      <form onSubmit={handleSubmit}>
        <div className="form__unit">
          <Input
            placeholder="Chat Name"
            type="text"
            value={chatName}
            className="form__input"
            onChange={(e) => setChatName(e)}
            size="lg"
          />
          {chatNameError && (
            <span className="form__error">invalid chat name</span>
          )}
        </div>
        <div className="form__unit">
          <AsyncSelect
            cacheOptions
            placeholder="Search by username"
            loadOptions={promiseOptions}
            defaultOptions
            name="members"
            isMulti
            onChange={onChange}
            styles={colourStyles}
          />
          {membersError && (
            <span className="form__error">add members to your chat</span>
          )}
        </div>

        <div className="rs-modal-footer">
          <Button
            disabled={!chatName.trim().length || !members || !members.length}
            type="submit"
            appearance="primary"
          >
            Create chat
          </Button>
          <Button onClick={close} appearance="subtle">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

const CreateChatModal = () => {
  const { data } = useQuery(IS_MODAL_OPEN);
  const close = () => {
    isModalOpen(false);
  };
  return (
    <Modal backdrop={true} show={data?.isModalOpen} onHide={close}>
      <Modal.Header>
        <Modal.Title>Create Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal__body">
        <CreateChatForm close={close} />
      </Modal.Body>
    </Modal>
  );
};
export const SignOut = () => {
  // const [signOut] = useLazyQuery(CURRENT_USER);
  return (
    <Dropdown.Item
      onSelect={() => {
        removeCookie(`${process.env.APP_SECRET}`, () => {
          window.location.reload();
          //   client.writeQuery({
          //   query: CURRENT_USER,
          //   data: {
          //     me: null,
          //   },
          // });
        });
      }}
    >
      <Icon icon="sign-out" /> Logout
    </Dropdown.Item>
  );
};

const NavbarChat = ({ me }: Props) => {
  const { username, name } = me;
  let arrName = name.split(" ");
  return (
    <Navbar className="nav">
      <div className="nav__header">
        <h3>Talklo</h3>
      </div>
      <CreateChatModal />
      <div className="nav__options">
        <ul className="nav__list">
          <li className="nav__item">
            <IconButton
              onClick={() => isDrawerOpen(true)}
              icon={<Icon icon="search" />}
              className="nav__button"
              size="lg"
            />
          </li>
          <li className="nav__item">
            <Button
              onClick={() => isModalOpen(true)}
              className="nav__button"
              size="lg"
            >
              <Icon icon="group" /> Create Chat
            </Button>
          </li>
          <li className="nav__item">
            <Dropdown
              renderTitle={(children) => {
                return (
                  <Button className="p-none shadow">
                    <div className="nav__user" title={name}>
                      <div className="nav__user__char">
                        {arrName.length > 1
                          ? arrName[0][0] + arrName[1][0]
                          : name[0] + name[1]}
                      </div>
                      <div className="nav__user__name">@{username}</div>
                    </div>
                  </Button>
                );
              }}
            >
              <SignOut />
            </Dropdown>
          </li>
        </ul>
      </div>
    </Navbar>
  );
};
export default NavbarChat;
