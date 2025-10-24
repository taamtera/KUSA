"use client";

export default function MessageBubble({ message, fromCurrentUser }) {
  const isPending = message.pending;

  return (
    <div
      className={`relative inline-block px-4 py-2 rounded-2xl break-words bg-gray-300 text-gray-900 ${isPending ? "opacity-60 animate-pulse" : ""}`}
      style={{
        maxWidth: "min(80vw, 28rem)",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
      }}
    >
      <p>{message.content}</p>
    </div>
  );
}