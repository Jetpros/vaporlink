"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Send, X } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onCancel,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>(
    Array(40).fill(0.1)
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startRecording();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      source.connect(analyserRef.current);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      visualizeWaveform();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (onCancel) onCancel();
    }
  };

  const visualizeWaveform = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const animate = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      const samples = 40;
      const step = Math.floor(dataArray.length / samples);
      const newWaveform = [];

      for (let i = 0; i < samples; i++) {
        const index = i * step;
        const value = dataArray[index] / 255;
        newWaveform.push(Math.max(0.1, value));
      }

      setWaveformData(newWaveform);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      onRecordingComplete(audioBlob, duration);
    }
  };

  const handleCancel = () => {
    stopRecording();
    setAudioURL(null);
    setDuration(0);
    audioChunksRef.current = [];
    if (onCancel) onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2.5">
      {isRecording ? (
        <>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <div className="flex items-center space-x-0.5 flex-1 h-8">
            {waveformData.map((height, index) => (
              <div
                key={index}
                className="bg-indigo-500 rounded-full transition-all duration-75"
                style={{
                  width: "3px",
                  height: `${height * 100}%`,
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 min-w-[40px] tabular-nums">
            {formatDuration(duration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={stopRecording}
            className="text-gray-600 hover:text-gray-900 h-8 w-8 rounded-full"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900 h-8 w-8 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
          <audio src={audioURL || ""} controls className="flex-1 h-8" />
          <span className="text-sm text-gray-600 tabular-nums">
            {formatDuration(duration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 h-8 w-8 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            className="bg-indigo-500 hover:bg-indigo-600 text-white h-8 w-8 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
