import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { useForm, SubmitHandler } from 'react-hook-form';

type QueryProps = {
  name: string;
  id: string;
};

type MessageProps = {
  name: string;
  message: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Array<MessageProps>>([]);
  const [status, setStatus] = useState<Array<string>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { push, query } = useRouter();
  const { id, name } = query as QueryProps;

  const socket = useMemo(
    () => io(`${process.env.NEXT_PUBLIC_API_URL}/room`),
    []
  );

  const sendMessage: SubmitHandler<{ message: string }> = ({ message }) => {
    socket.emit('send-message', { message });
    setMessages((oldState) => [...oldState, { message, name }]);
    reset();
  };

  useEffect(() => {
    if (!name || !id) push('/');

    socket.on('connect', () => {
      socket.emit('join', {
        name,
        room_id: id,
      });

      socket.emit('send-status-user', {
        status: `${name} acabou de entrar na sala...`,
        room_id: id,
      });
    });

    socket.on('receive-message', (content: MessageProps) => {
      setMessages((oldState) => [...oldState, content]);
    });

    socket.on('receive-status-user', ({ status }) => {
      setStatus((oldState) => [...oldState, status]);
    });
  }, [socket, name, id]);

  return (
    <>
      <p>{`Sala ${id}`}</p>
      {status.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
      <form onSubmit={handleSubmit(sendMessage)}>
        <label htmlFor="message-user">
          Digite sua mensagem
          <input
            autoFocus
            id="message-user"
            {...register('message', { required: true })}
          />
        </label>
        <button type="submit">Enviar</button>
        {errors.message && <p style={{ color: 'red' }}>Campo obrigatório</p>}
      </form>
      <div>
        <p>Mensagens</p>
        {messages.map((message, index) => (
          <p key={`${message}${index}}`}>
            {message.name} - {message.message}
          </p>
        ))}
      </div>
    </>
  );
}
