import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats($userID: String) {
    aliveChats(userID: $userID) {
      uuid
      name
      type
      ownerID
      userID
      muteID
      adminID
      password
      getBan {
        login
        bannedUntil
      }
      getMessages {
        index
        userID
        message
        createdAt
      }
      getMute {
        login
        mutedUntil
      }
    }
  }
`;
export const UPDATE_CHAT = gql`
mutation	UpdateChat($newinfo : UpdateChatInput!) {
  updateChat(updateChatInput: $newinfo) {
    uuid
  }
}
`;
export const CREATE_CHAT = gql`
mutation CreateChat($newChat: AddChatInput!) {
    addChat(addChatInput: $newChat) {
      uuid
      name
      type
      ownerID
      userID
    }
  }
`;
export const ADD_MESSAGE = gql`
mutation AddMessages($newMessage: AddMessageInput!) {
  addMessage(addMessageInput: $newMessage) {
    userID
    chatUUID
  }
}
`;
export const REMOVE_CHAT = gql`
mutation	RemoveChat($uuid : String!) {
  removeChat(uuid: $uuid) {
    uuid
  }
}
`;
export const GET_MESSAGES = gql`
query GetMessages($uuid: String!) {
  getMessages(uuid: $uuid) {
    chatUUID
    message
    userID
    createdAt
  }
}
`;
export const CHECK_PASSWORD = gql`
query checkPassword($uuid : String!, $pass: String!) {
  checkChatPassword(uuid: $uuid, password: $pass)
}
`;
export const MUTE = gql`
mutation ToggleMute($uuid : String!, $userID: String!, $duration: Float!) {
  toggleMute(uuid: $uuid, userID: $userID, duration: $duration) {
    login
  }
}
`;
export const KICK = gql`
mutation ForcedOut($uuid : String!, $userID: String!, $duration: Float!) {
  forcedOut(uuid: $uuid, userID: $userID, duration: $duration) {
    login
  }
}
`;
export const ADMIN = gql`
mutation ToggleAdmin($uuid : String!, $userID: String!) {
  toggleAdmin(uuid: $uuid, userID: $userID) {
    adminID
  }
}
`;
export const ADDTOCHAT = gql`
mutation AddToChat($uuid : String!, $userID: String!) {
  addToChat(uuid: $uuid, userID: $userID) {
    userID
  }
}
`;

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($uuid: String!) {
    messageAdded(uuid: $uuid) {
      index
      userID
      message
      createdAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    user {
      login
    }
  }
`;

export const GET_USER = gql`
query getUser($userID: String!) {
  getByLogin(userID: $userID) {
    login
    friendList
    blackList
  }
}
`;

export const BLOCK_USER = gql`
mutation BlockUser($from: String! , $userID: String!) {
  blockUser(from: $from, userID: $userID) {
    blackList
  }
}
`;


export const GET_CHAT = gql`
  query GetChat($uuid: String!) {
    chats(uuid: $uuid) {
      index
      uuid
      name
      type
      ownerID
      adminID
      userID
      muteID
      getBan {
        login
        bannedUntil
      }
      getMessages {
        index
        userID
        message
        createdAt
      }
      getMute {
        login
        mutedUntil
      }
    }
  }
`;