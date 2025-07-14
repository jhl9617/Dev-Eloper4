import { ImageResponse } from 'next/og';

export const alt = 'DevBlog - Modern Blog Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            DevBlog
          </h1>
          <p
            style={{
              fontSize: 32,
              color: 'white',
              textAlign: 'center',
              opacity: 0.9,
            }}
          >
            Modern Blog Platform
          </p>
          <p
            style={{
              fontSize: 24,
              color: 'white',
              textAlign: 'center',
              opacity: 0.7,
              marginTop: 20,
            }}
          >
            Built with Next.js & Supabase
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}