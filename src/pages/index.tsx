import { useRouter } from "next/router"

export default function Home() {
  const navigation = useRouter()

  function handleOption(option: string) {
    navigation.push(`${option}`)
  }

  return (
    <div>
      <button onClick={() => handleOption('room-chat')}>Ir para sala de chat</button>
      <br />
      <br />
      <button onClick={() => handleOption('room-video')}>Ir para sala de vídeo</button>
    </div>
  )
} 