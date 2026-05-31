/**
 * LESHEM.S OS — v2 Entry Point
 *
 * Accessible at /v2
 * Completely isolated from the existing MVP at /
 *
 * IMPORTANT:
 * - No global CSS import here (Next.js Pages Router restriction)
 * - All styles are CSS Modules scoped to v2 components
 * - Does NOT modify pages/index.js or any existing page
 * - Does NOT change _app.js
 */

import Head from 'next/head';
import V2Shell from '../components/v2/V2Shell';

export default function V2Page() {
  return (
    <>
      <Head>
        <title>LESHEM.S OS · v2</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>
      <V2Shell />
    </>
  );
}
