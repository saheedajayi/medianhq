/**
 * Stops all browser media tracks (video and audio) to ensure the webcam/mic
 * hardware indicator light turns off immediately when a call or preview ends.
 */
export function stopAllMediaTracks() {
  if (typeof window === "undefined") return;

  try {
    // Find all video and audio elements in the DOM and stop their MediaStream tracks
    const mediaElements = document.querySelectorAll<HTMLMediaElement>("video, audio");
    mediaElements.forEach((el) => {
      if (el.srcObject && el.srcObject instanceof MediaStream) {
        el.srcObject.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // Ignore error on already stopped track
          }
        });
        el.srcObject = null;
      }
    });
  } catch (err) {
    console.warn("Failed to stop media elements tracks:", err);
  }
}
