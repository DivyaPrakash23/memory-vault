import { useState, useCallback } from "react";
import { startSpeechRecognition, speakText } from "../services/speech";

export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript,  setTranscript]  = useState("");
  const [error,       setError]       = useState(null);

  const listen = useCallback(() => {
    setIsListening(true);
    setError(null);

    startSpeechRecognition(
      (text) => {
        setTranscript(text);
        setIsListening(false);
      },
      (err) => {
        setError(err);
        setIsListening(false);
      }
    );
  }, []);

  const speak = useCallback((text) => speakText(text), []);

  return { listen, speak, isListening, transcript, error, setTranscript };
};

