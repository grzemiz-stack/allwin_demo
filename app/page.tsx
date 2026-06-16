import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--ink)',
        color: '#fff',
        fontFamily: 'var(--body)',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, marginBottom: 12 }}>Allwin</h1>
        <p style={{ color: 'var(--on-ink-mute)', marginBottom: 20 }}>
          Asystent głosowy + konsola operacyjna na żywo.
        </p>
        <Link
          href="/demo"
          style={{
            display: 'inline-block',
            background: 'var(--signal)',
            color: '#fff',
            textDecoration: 'none',
            fontFamily: 'var(--display)',
            fontWeight: 600,
            padding: '13px 22px',
            borderRadius: 11,
          }}
        >
          Zobacz demo →
        </Link>
      </div>
    </main>
  );
}
