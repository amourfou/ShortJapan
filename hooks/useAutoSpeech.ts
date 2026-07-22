"use client";

import { useEffect, useRef, useState } from "react";
import {
  isSpeechRecognitionSupported,
  startContinuousKorean,
  type SpeechSession,
} from "@/lib/speechRecognition";

/**
 * Auto-start continuous Korean STT while `active` is true.
 * Resets when `resetKey` changes.
 */
export function useAutoSpeech(active: boolean, resetKey: string | number) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<SpeechSession | null>(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    // cleanup previous
    sessionRef.current?.stop();
    sessionRef.current = null;
    transcriptRef.current = "";
    setTranscript("");
    setError(null);
    setListening(false);

    if (!active || !isSpeechRecognitionSupported()) {
      if (active && !isSpeechRecognitionSupported()) {
        setSupported(false);
      }
      return;
    }

    const session = startContinuousKorean({
      onTranscript: (text) => {
        transcriptRef.current = text;
        setTranscript(text);
      },
      onListeningChange: setListening,
      onError: (e) => {
        setError(e);
        if (e === "unsupported") setSupported(false);
      },
    });
    sessionRef.current = session;

    return () => {
      session?.stop();
      sessionRef.current = null;
    };
  }, [active, resetKey]);

  const stop = () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setListening(false);
  };

  const getTranscript = () => transcriptRef.current || transcript;

  return {
    transcript,
    listening,
    supported,
    error,
    stop,
    getTranscript,
  };
}
