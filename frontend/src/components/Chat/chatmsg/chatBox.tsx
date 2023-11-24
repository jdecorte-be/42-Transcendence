import { ActionIcon, Group, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { Send } from "tabler-icons-react";
import { useMutation, useReactiveVar} from "@apollo/client";
import { ADD_MESSAGE} from "../query/query";
import { currentLoginVar } from "../../../apollo/apolloProvider";
import { ToastContainer, toast } from "react-toastify";

const ChatBox = ({ uuid }: any) => {
  const [value, setValue] = useState("");
  const currentLogin = useReactiveVar(currentLoginVar);

  const [addMessage] = useMutation(ADD_MESSAGE);

  function sendMsg() {
    if(value.length > 0) {
      addMessage({
        variables: { newMessage: { chatUUID: uuid, userID: currentLogin, message: value }},
      }).catch((err) => {
        toast.error('You are muted!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      })
      setValue("");
    }
  }

  return (
    <Stack sx={{ height: "8vh", bottom: 0, position: 'absolute' }} justify="center" p={0}>
      <Group position="right">

        <TextInput
          onKeyDown={(e) => {
            if (e.keyCode === 13)
              sendMsg();
          }
          }
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          sx={{ flexGrow: 1 }}
          placeholder="Say something nice . . . "
        />
        <ActionIcon
          variant="outline"
          size="lg"
          onClick={() => sendMsg()}
          disabled={
            !/\S/.test(value) ? true : value.length < 1 ? true : false
          }
        >
          <Send />
        </ActionIcon>
      </Group>
      <ToastContainer
        position='top-center'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
      />
    </Stack>
  );
};

export default ChatBox;