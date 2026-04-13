import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage(): React.ReactElement {
  return (
    <Card className="flex flex-col gap-0">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <p className="text-body text-text-secondary">
          Log in to manage your uploads.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <LoginForm />
        <p className="text-caption text-text-tertiary">
          No account?{' '}
          <Link
            href="/auth/register"
            className="text-accent transition-colors hover:text-accent-hover"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
