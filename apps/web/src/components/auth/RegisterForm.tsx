'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RegisterSchema,
  type AuthResponse,
  type RegisterRequest,
} from '@picflow/shared';
import toast from 'react-hot-toast';
import { register as apiRegister } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function RegisterForm(): React.ReactElement {
  const router = useRouter();
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: '', username: '', password: '' },
  });

  const mutation = useMutation<AuthResponse, ApiError, RegisterRequest>({
    mutationFn: apiRegister,
    onSuccess: () => {
      toast.success('Account created');
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      router.push('/dashboard');
      router.refresh();
    },
    onError: (err) => toast.error(err.messages[0] ?? 'Registration failed'),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={mutation.isPending}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-caption text-error">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoComplete="username"
          placeholder="drop_master"
          disabled={mutation.isPending}
          {...register('username')}
        />
        {errors.username && (
          <p className="text-caption text-error">{errors.username.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          disabled={mutation.isPending}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-caption text-error">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={mutation.isPending}
        className="mt-2"
      >
        {mutation.isPending && <LoadingSpinner size="sm" />}
        Create account
      </Button>
    </form>
  );
}
