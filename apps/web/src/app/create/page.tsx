import { Suspense } from 'react';
import { CreatePageInner } from './CreatePageInner';

export default function CreatePage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <CreatePageInner />
    </Suspense>
  );
}
