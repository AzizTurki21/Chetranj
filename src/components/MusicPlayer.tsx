import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const YOUTUBE_VIDEO_ID = 'kzF96gR1diQ';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume] = useState(0.3);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if script already exists
    if ((window as any).YT) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = initPlayer;

    function initPlayer() {
      if (playerRef.current) return;
      
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID,
        },
        events: {
          onReady: () => {
            setIsReady(true);
            playerRef.current?.setVolume(volume * 100);
          },
          onStateChange: (event: any) => {
            // -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = video cued
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            }
          }
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(isMuted ? 0 : volume * 100);
    }
  }, [volume, isMuted, isReady]);

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  // Auto-play when component mounts (for game start)
  useEffect(() => {
    if (isReady && playerRef.current && !isPlaying) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [isReady]);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-md text-amber-100 p-3 rounded-xl border border-amber-900/50 shadow-2xl flex items-center gap-4 w-72">
      {/* Hidden YouTube Player */}
      <div className="hidden">
        <div id="youtube-player"></div>
      </div>
      
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs text-amber-400 font-medium">Now Playing</span>
        <span className="text-sm truncate font-serif">Kahweji ydour</span>
        <span className="text-[10px] text-amber-500/70 truncate">♫ Audio</span>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={togglePlay} 
          className="p-2 hover:bg-white/10 rounded-full transition active:scale-95"
          disabled={!isReady}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
};
