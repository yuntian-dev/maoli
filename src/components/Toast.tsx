export function Toast({ message }: { message: string }) {
  return (
    <div
      className="font-hand"
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '8px 20px',
        borderRadius: '2px',
        fontSize: '14px',
        zIndex: 300,
        boxShadow: 'var(--shadow-lift)',
        pointerEvents: 'none',
      }}
      role="status"
    >
      {message}
    </div>
  );
}
