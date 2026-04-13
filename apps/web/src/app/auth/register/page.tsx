import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Sign up' };

export default function RegisterPage(): React.ReactElement {
  return (
    <Card className="flex flex-col gap-0">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <p className="text-body text-text-secondary">
          Takes 15 seconds. No email confirmation required.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <RegisterForm />
        <p className="text-caption text-text-tertiary">
          Already have one?{' '}
          <Link
            href="/auth/login"
            className="text-accent transition-colors hover:text-accent-hover"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
