'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const App = dynamic(() => import('../spa/App'), { ssr: false });

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <App />
    </Suspense>
  );
}
