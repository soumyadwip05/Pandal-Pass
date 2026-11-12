export default function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={`toast${visible ? " is-visible" : ""}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
