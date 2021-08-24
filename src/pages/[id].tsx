import { useRef, useState } from "react"
import { useRouter } from "next/router"

export default function OptionChat() {
  const navigation = useRouter()
  const { id } = navigation.query

  const [openChat, setOpenChat] = useState(false)

  const refName = useRef<HTMLInputElement>(null)

  function saveName() {
    if(!!refName.current?.value) setOpenChat(true)
  }

  function toRoom(id: string) {
    const name = refName.current?.value
    navigation.push(`/chat?id=${id}&name=${name}`, '/chat');
  }

  function toRoomVideo(id: string) {
    const name = refName.current?.value
    navigation.push(`/video?id=${id}&name=${name}`, '/video');
  }

  return (
    <>
      <div>
        <label>
          Seu nome
          <input ref={refName} />
        </label>
        <button onClick={saveName}>Salvar</button>
      </div>
      {openChat && (
        id === 'room-chat' ? (
          <>
            <div>
              <span>Sala 1</span>
              <button onClick={() => toRoom('1')}>Entrar</button>
            </div>
            <div>
              <span>Sala 2</span>
              <button onClick={() => toRoom('2')}>Entrar</button>
            </div>
            <div>
              <span>Sala 3</span>
              <button onClick={() => toRoom('3')}>Entrar</button>
            </div>
          </>
        ) : (
          <>
          <div>
            <span>Sala 4</span>
            <button onClick={() => toRoomVideo('4')}>Entrar</button>
          </div>
          <div>
            <span>Sala 5</span>
            <button onClick={() => toRoomVideo('5')}>Entrar</button>
          </div>
          <div>
            <span>Sala 6</span>
            <button onClick={() => toRoomVideo('6')}>Entrar</button>
          </div>
        </>
        )
      )}
    </>
  )
}
