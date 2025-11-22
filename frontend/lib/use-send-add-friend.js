export async function sendFriendRequest(toUsername) {
  if (!toUsername.trim()) {
    return { status: "failed", message: "Username is required" };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/friend/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ toUsername }),
    });

    const data = await res.json();
    return data; // { status: 'success'|'failed', message: '...' }
  } catch (err) {
    console.error("Error sending friend request:", err);
    return { status: "failed", message: "Error sending friend request" };
  }
}
