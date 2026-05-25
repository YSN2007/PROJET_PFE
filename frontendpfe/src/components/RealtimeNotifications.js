import { useEffect } from "react";
import { getEcho } from "../services/echo";
import { notifyInfo } from "../utils/notifications";

function RealtimeNotifications() {
  useEffect(() => {
    const echo = getEcho();

    if (!echo) {
      return undefined;
    }

    const channel = echo.channel("notes");

    channel.listen(".NoteCreated", (event) => {
      const stagiaireName = event?.stagiaire_name || "un stagiaire";
      const moduleName = event?.module_name ? ` - ${event.module_name}` : "";

      notifyInfo(`Nouvelle note ajoutée pour ${stagiaireName}${moduleName}`, {
        toastId: `realtime-note-${stagiaireName}-${event?.module_name || ""}-${event?.note_value || ""}`,
      });
    });

    return () => {
      echo.leaveChannel("notes");
    };
  }, []);

  return null;
}

export default RealtimeNotifications;
