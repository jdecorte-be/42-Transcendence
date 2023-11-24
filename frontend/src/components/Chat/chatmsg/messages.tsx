import { ActionIcon, Avatar, Button, Group, ScrollArea, Text } from "@mantine/core";
import { getHotkeyHandler, useScrollIntoView } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { MoodHappy, Send } from "tabler-icons-react";
import ChatBox from "./chatBox";
import { useLazyQuery, useQuery, useReactiveVar, useSubscription } from "@apollo/client";
import { GET_MESSAGES, GET_USER, MESSAGE_ADDED_SUBSCRIPTION } from "../query/query";
import axios from "axios";
import { currentAvatarVar, currentChatVar, currentLoginVar } from "../../../apollo/apolloProvider";
import * as moment from "moment";
import { ToastContainer, toast } from 'react-toastify';




export const ChatMessages = ({ ...props }) => {
    const { chatMessages, subscribeToNewMessage, chat } = props;

    const [avatars, setAvatars] = useState({});
    const currentChat = useReactiveVar(currentChatVar);
    const currentLogin = useReactiveVar(currentLoginVar);
    const currentAvatar = useReactiveVar(currentAvatarVar);

    const { data, loading, error } = useQuery(GET_USER, {
        variables: {
            userID: currentLogin,
        },
    });

    useEffect(() =>
        subscribeToNewMessage(),
    []);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);


    if (loading) {
        return <>Loading...</>;
    }
    if (error) {
        return <>ERROR</>;
    }

    const lastBan = chat.getBan.find((elem) => elem.login === currentLogin)
    if (lastBan && moment.default().diff(lastBan.bannedUntil, 'minutes') < 0) {
        toast.error('You are banned from this group!', {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
        });
        return <>You are banned</>;
    }

    // ─────────────────────────────────────────────────────────────────────────────


    async function loadAvatar(login_rec) {
        try {
            const response = await axios.get(`http://localhost:3001/app/users/avatar/${login_rec}`);
            const newAvatars = { ...avatars };
            newAvatars[login_rec] = response.data.avatar;
            setAvatars(newAvatars);
        } catch (error) {
            console.log(error);
        }
    }

    function getAvatar(login_rec) {
        !avatars[login_rec] && loadAvatar(login_rec);
        return avatars[login_rec] ? avatars[login_rec] : null;
    }


    // ─────────────────────────────────────────────────────────────────────────────

    const lastMute = chat.getMute.find((elem) => elem.login === currentLogin);

    return (
        <div>
            {
                chatMessages[0] ?
                    <ScrollArea style={{ height: 450 }} scrollbarSize={0}>

                        {
                            chatMessages.map((elem: { message: string, userID: string, createdAt: Date }, index) => (
                                <div key={index} id={'id' + index} className="message" style={
                                    data.getByLogin.blackList.includes(elem.userID) ? { filter: "blur(3px)" } : { filter: "blur(0px)" }
                                }>
                                    {
                                        elem.userID === currentLogin ?
                                            <>
                                                <Avatar size={40} color="blue" src={`data:image/jpeg;base64,${currentAvatar}`}></Avatar>
                                                <div className="text">
                                                    <p>{elem.message}</p>
                                                </div>
                                            </>

                                            :

                                            <>
                                                <div className="text">
                                                    <p>{elem.message}</p>
                                                </div>
                                                <Avatar size={40} color="blue" src={`data:image/jpeg;base64,${getAvatar(elem.userID)}`}></Avatar>
                                            </>
                                    }
                                </div>
                            ))
                        }
                        <div ref={messagesEndRef} />
                    </ScrollArea>

                    :
                    <Text
                        c="dimmed"
                        size={15}
                    >No messages have been send.</Text>
            }
            {
                lastMute && (moment.default().diff(lastMute.mutedUntil, 'minutes') < 0) ?
                    <Text
                        c="dimmed"
                        className="center"
                        size={15}
                        style={{
                            color: "red",
                        }}
                    >You are muted for {Math.abs(moment.default().diff(lastMute.mutedUntil, 'minutes'))} minutes </Text>
                    :
                    <ChatBox uuid={currentChat.uuid}></ChatBox>
            }

            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    )
}