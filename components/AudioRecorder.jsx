"use client";

import { useRef, useState } from "react";

// Try codecs in order of preference. The bug this fixes: the old version
// always labeled the recorded Blob as "audio/webm" no matter what codec
// the browser actually used, so the <audio> element tried to decode the
// wrong container and showed "Error" instead of playing it back. Now we
// ask the browser what it can actually record, and tag the Blob with that
// exact mimeType.
const CANDIDATE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function pickSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  return CANDIDATE_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

export default function AudioRecorder({ onRecorded }) {
  const [status, setStatus] = useState("idle"); // idle | recording | recorded | error
  const [audioUrl, setAudioUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeTypeRef = useRef("");

  async function startRecording() {
    setErrorMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickSupportedMimeType();
      mimeTypeRef.current = mimeType;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());

        if (chunksRef.current.length === 0) {
          setErrorMessage("No audio was captured — please try recording again.");
          setStatus("error");
          return;
        }

        // Use the recorder's own reported mimeType if available, falling
        // back to what we requested — this is what actually fixes playback.
        const blobType = recorder.mimeType || mimeTypeRef.current || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("recorded");
        onRecorded?.(blob);
      };

      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e.error);
        setErrorMessage("Recording failed — please try again.");
        setStatus("error");
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus("recording");
    } catch (err) {
      console.error("getUserMedia error:", err);
      setErrorMessage(
        err?.name === "NotAllowedError"
          ? "Microphone access was denied — allow mic access in your browser and try again."
          : "Couldn't access your microphone. Check your device settings and try again."
      );
      setStatus("error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function reRecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setErrorMessage("");
    setStatus("idle");
    onRecorded?.(null);
  }

  return (
    <div className="rounded-card border border-slate-light bg-white/60 p-4">
      <div className="flex items-center gap-3 flex-wrap">
        {status !== "recording" ? (
          <button
            type="button"
            onClick={startRecording}
            className="font-mono text-xs px-3 py-2 rounded-lg bg-ink text-paper hover:bg-violet transition-colors"
          >
            {status === "recorded" ? "Re-record" : "● Record"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="font-mono text-xs px-3 py-2 rounded-lg bg-violet text-paper animate-pulse"
          >
            ■ Stop
          </button>
        )}
        {status === "recorded" && (
          <button
            type="button"
            onClick={reRecord}
            className="font-mono text-xs px-3 py-2 rounded-lg border border-slate-light text-slate hover:border-violet hover:text-violet transition-colors"
          >
            Discard
          </button>
        )}
        <span className="text-xs text-slate">
          {status === "idle" && "Not recorded yet"}
          {status === "recording" && "Recording…"}
          {status === "recorded" && "Recorded — you can play it back below"}
          {status === "error" && errorMessage}
        </span>
      </div>
      {audioUrl && (
        <audio controls src={audioUrl} className="mt-3 w-full">
          Your browser does not support audio playback.
        </audio>
      )}
    </div>
  );
}
