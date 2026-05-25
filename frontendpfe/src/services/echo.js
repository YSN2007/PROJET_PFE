import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance = null;

export function getEcho() {
  if (echoInstance) {
    return echoInstance;
  }

  const key = process.env.REACT_APP_PUSHER_APP_KEY;

  if (!key) {
    return null;
  }

  window.Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: "pusher",
    key,
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER || "mt1",
    wsHost: process.env.REACT_APP_PUSHER_HOST || window.location.hostname,
    wsPort: Number(process.env.REACT_APP_PUSHER_PORT || 6001),
    wssPort: Number(process.env.REACT_APP_PUSHER_PORT || 6001),
    forceTLS: String(process.env.REACT_APP_PUSHER_SCHEME || "").toLowerCase() === "https",
    enabledTransports: ["ws", "wss"],
    disableStats: true,
  });

  return echoInstance;
}

export function disconnectEcho() {
  if (!echoInstance) {
    return;
  }

  echoInstance.disconnect();
  echoInstance = null;
}
