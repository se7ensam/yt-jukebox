'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'password',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: 'Login Successful',
          description: 'Redirecting to host dashboard...',
        });
        router.push('/host');
      } catch (error: any) {
        // Handle both 'user-not-found' and 'invalid-credential' for broader compatibility
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          // If user doesn't exist, create a new one
          try {
            await createUserWithEmailAndPassword(auth, data.email, data.password);
            toast({
              title: 'Admin Account Created',
              description: 'Redirecting to host dashboard...',
            });
            router.push('/host');
          } catch (creationError: any) {
            console.error('Account creation error:', creationError);
            toast({
              variant: 'destructive',
              title: 'Account Creation Failed',
              description: creationError.message || 'Could not create an admin account.',
            });
          }
        } else {
          console.error('Login error:', error);
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message || 'Invalid credentials. Please try again.',
          });
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the host panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
