// app/lib/SuspenseBoundary.tsx
'use client';

import { Suspense } from 'react';

export function withSuspense<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithSuspenseComponent(props: P) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>}>
        <Component {...props} />
      </Suspense>
    );
  };
}