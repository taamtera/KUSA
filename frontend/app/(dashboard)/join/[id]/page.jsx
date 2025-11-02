"use client";

export default function JoinPage({ params }) {
  const { id } = params;
    return (
    <div>
      <h1>Join Server</h1>
      <p>You are about to join the server with ID: {id}</p>
        {/* Additional UI elements and logic for joining the server can be added here */}
    </div>
  );
}