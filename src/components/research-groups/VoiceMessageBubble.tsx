import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface VoiceMessageBubbleProps {
    audioUrl: string;
    isMe: boolean;
}

export default function VoiceMessageBubble({ audioUrl, isMe }: VoiceMessageBubbleProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(Number(e.target.value));
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-3 p-2 rounded-xl min-w-[200px] ${isMe ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <button
                onClick={togglePlay}
                className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-colors ${isMe
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
            >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="ml-0.5" />
            </button>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
                {/* Waveform Animation Placeholder (using bars) */}
                <div className="h-6 flex items-center gap-0.5">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`w-1 rounded-full ${isMe ? 'bg-white/60' : 'bg-gray-400 dark:bg-gray-600'}`}
                            initial={{ height: 4 }}
                            animate={{
                                height: isPlaying ? [4, 16, 8, 20, 4][i % 5] : 4,
                                opacity: isPlaying ? 1 : 0.6
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: "easeInOut",
                                delay: i * 0.05,
                                repeatType: "mirror"
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium w-8 ${isMe ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(audioRef.current?.currentTime || 0)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className={`w-full h-1 rounded-full appearance-none cursor-pointer focus:outline-none ${isMe ? 'bg-white/30 accent-white' : 'bg-gray-300 dark:bg-gray-600 accent-blue-500'
                            }`}
                    />
                    <span className={`text-[10px] font-medium w-8 text-right ${isMe ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
}
