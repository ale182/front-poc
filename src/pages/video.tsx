import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

type QueryProps = {
  name: string;
  id: string;
};

let peer: any = null;

export default function Video() {
  const [muteAudio, setMuteAudio] = useState(false);
  const [myVideoStream, setMyVideoStream] = useState<MediaStream>();
  const navigation = useRouter();
  const { id, name } = navigation.query as QueryProps;

  const socket = useMemo(
    () => io(`${process.env.NEXT_PUBLIC_API_URL}/video`),
    []
  );

  const getVideo = () => {
    const myVideo = document.createElement('video');
    return myVideo;
  };

  const addVideoStream = (video: any, stream: any) => {
    const videoGrid = document.getElementById('video-grid');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    videoGrid!.append(video);
  };

  const connectToNewUser = (userId: string, stream: any) => {
    var call = peer.call(userId, stream);
    const video = getVideo();
    call.on('stream', function (remoteStream: any) {
      addVideoStream(video, remoteStream);
    });
  };

  const muteUnmute = () => {
    const enabled = myVideoStream!.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream!.getAudioTracks()[0].enabled = false;
      setMuteAudio(true);
    } else {
      setMuteAudio(false);
      myVideoStream!.getAudioTracks()[0].enabled = true;
    }
  };

  useEffect(() => {
    // if (!id || !name) navigation.push('/');
    const boot = async () => {
      const Peer = (await import('peerjs')).default;
      peer = new Peer(undefined , {
        // path: "",
        host:  'sc-poc-videochat-peerjs.herokuapp.com',
        secure:true
        // port: 443,
      });

      window.navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then((stream) => {
          const myVideo = getVideo();
          myVideo.muted = true;
          setMyVideoStream(stream);
          addVideoStream(myVideo, stream);

          socket.on('user-connected', (userId) => {
            connectToNewUser(userId, stream);
          });
        });

      peer.on('open', (user_id: string) => {
        socket.emit('join', {
          user_id,
          room_id: id,
        });
      });

      peer.on('call', function (call: any) {
        window.navigator.getUserMedia(
          { video: true, audio: true },
          (stream) => {
            call.answer(stream);
            const video = getVideo();
            call.on('stream', function (remoteStream: any) {
              addVideoStream(video, remoteStream);
            });
          },
          (err) => {
            console.log('Failed to get local stream', err);
          }
        );
      });
    };

    socket.on('user-disconnected', (content) => {
      console.log('disconectado');
    });

    // socket.on('receive-status-user', ({status}) => {
    //   setStatus(oldState => [...oldState, status])
    // })

    boot();
  }, []);

  return (
    <>
      <div>Video - {name} </div>
      <div id="video-grid"></div>
      <div>
        {muteAudio ? (
          <button onClick={muteUnmute}>Desmute Áudio</button>
        ) : (
          <button onClick={muteUnmute}>Mute Áudio</button>
        )}
      </div>
    </>
  );
}
