import { Drawer, Input, InputGroup, Icon, Divider, Avatar } from "rsuite";
import { useQuery, gql } from "@apollo/client";
import { isDrawerOpen, searchKeyword } from "../../libs/withApollo";
import LoadingComponent from "../loading/LoadingComponent";
const IS_DRAWER_OPEN = gql`
  query isDrawerOpen {
    isDrawerOpen @client
  }
`;

export const GET_USERS = gql`
  query getUsers($keyword: String!) {
    users(keyword: $keyword) {
      id
      name
      username
      isOnline
    }
  }
`;
const SEARCH__KEYWORD = gql`
  query searchKeyword {
    searchKeyword @client
  }
`;
interface User {
  id: string;
  name: string;
  username: string;
  isOnline: string;
}
let timer: any;
const DrawerSearch = () => {
  const handleSearchChange = (keyword: any) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      searchKeyword(keyword);
    }, 400);
  };
  return (
    <div className="drawer__search">
      <InputGroup>
        <Input onChange={handleSearchChange} />
        <InputGroup.Addon>
          <Icon icon="search" />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
};
const RenderUsersList = ({ keyword }: any) => {
  const { data, loading, error } = useQuery(GET_USERS, {
    variables: {
      keyword,
    },
  });

  if (loading) return <LoadingComponent loading={true} />;
  if (data?.users) {
    return (
      <ul className="drawer__list">
        {data.users.map((user: User) => {
          return (
            <li key={user.id} className="drawer__item">
              <div className="chat__item">
                <div className="chat__img">
                  <Avatar size="md" circle className="chat__avatar">
                    {user.username[0] + user.username[1]}
                  </Avatar>
                </div>
                <div className="chat__info">
                  <div className="chat__info__title">
                    <div className="chat__info__name">
                      <span>{user.name}</span>
                    </div>
                  </div>
                  <div className="chat__info__des">
                    <span>@{user.username}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
  return null;
};
const DrawerListUser = () => {
  const { data } = useQuery(SEARCH__KEYWORD);
  return (
    <div className="drawer__users">
      {data?.searchKeyword.trim().length ? (
        <RenderUsersList keyword={data.searchKeyword} />
      ) : null}
    </div>
  );
};
const FriendDrawer = () => {
  const { data } = useQuery(IS_DRAWER_OPEN);
  const close = () => {
    isDrawerOpen(false);
  };
  return (
    <Drawer
      show={data?.isDrawerOpen}
      onHide={close}
      backdrop={true}
      placement="left"
      size="sm"
    >
      <Drawer.Header>
        <Drawer.Title>search on users by usernames</Drawer.Title>
      </Drawer.Header>
      <DrawerSearch />
      <Divider className="m-none" />
      <DrawerListUser />
    </Drawer>
  );
};
export default FriendDrawer;
