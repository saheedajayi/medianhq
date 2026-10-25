/** "23hrs left to respond" from the mentor's response deadline; null once it has passed */
export function formatTimeLeft(respondBy: string | undefined, now = Date.now()) {
  if (!respondBy) return null;
  const msLeft = new Date(respondBy).getTime() - now;
  if (msLeft <= 0) return null;
  const minutes = Math.floor(msLeft / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min${minutes === 1 ? "" : "s"} left`;
  const hours = Math.floor(minutes / 60);
  return `${hours}hr${hours === 1 ? "" : "s"} left`;
}
