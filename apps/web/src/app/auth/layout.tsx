import { PageContainer } from '@/components/layout/PageContainer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <PageContainer className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
      <div className="w-full max-w-sm">{children}</div>
    </PageContainer>
  );
}
