import Link from "next/link";

export default function NotFoundPage() => {
    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                html, body, #root {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
            `}</style>
            <div
                style={{
                    display: 'flex',
                    height: '100vh',
                    width: '100vw',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        color: '#fff',
                        padding: '40px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        animation: 'fadeIn 1s ease-in-out'
                    }}
                >
                    <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
                    <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Page Not Found</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                        Sorry, the page you're looking for doesn't exist.
                    </p>
                    <Link
                        to="/"
                        style={{
                            padding: '10px 20px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            backgroundColor: '#fff',
                            color: '#764ba2',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            transition: 'background 0.3s ease'
                        }}
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </>
    );
};
