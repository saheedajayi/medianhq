export function SpeechBubbleEmptyIcon({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3C7.03 3 3 6.94 3 11.8C3 13.62 3.56 15.32 4.54 16.74L3.25 20.35C3.07 20.85 3.52 21.32 4.02 21.16L7.85 19.95C9.13 20.67 10.53 21.08 12 21.08C16.97 21.08 21 16.66 21 11.8C21 6.94 16.97 3 12 3Z"
        fill="#FF5514"
      />
    </svg>
  );
}

export function AngledPaperPlaneIcon({ className = "size-4 text-white" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
