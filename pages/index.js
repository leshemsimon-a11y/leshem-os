// pages/index.js
//
// LESHEM.S OS — Root entry (Clean 4A)
//
// The root now opens the unified LESHEM.S OS dashboard instead of the old MVP
// surface. The previous MVP page is preserved untouched at /mvp (same code,
// same relative imports) and the isolated v2 remains at /v2. This file does a
// client-side redirect to /studio so the domain root lands on the dashboard
// without the user typing /studio.
//
// No MVP logic is modified, deleted, or imported here. No Airtable, no new
// packages.

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/studio');
  }, [router]);

  return (
    <>
      <Head>
        <title>LESHEM.S OS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#6E665A',
          background: '#FBF8F2',
        }}
      >
        טוען את LESHEM.S OS…
      </div>
    </>
  );
}
