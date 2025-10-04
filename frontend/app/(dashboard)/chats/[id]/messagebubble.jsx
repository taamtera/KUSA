"use client";

export default function MessageBubble({ message}) {

  return (
    <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 bg-gray-300 text-gray-900 rounded-bl-none" ${message.temp ? "opacity-50" : ""}`} >
      <p className="break-words">{message.content}</p>
    </div>
  );
}
