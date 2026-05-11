'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Card, 
  CardContent,
  CircularProgress,
  Link,
  Stack
} from '@mui/material';
import ShimmerButton from '@/components/ui/shimmer-button';
import { useToast } from '@/components/shared/ToastProvider';
import SparklesText from '@/components/ui/sparkles-text';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Login successful', 'success');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      showToast('An error occurred during login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-white hero-grain p-4">
      <Container maxWidth="sm">
        <Box className="text-center mb-10">
          <SparklesText 
            text="Anvil Attendance" 
            className="text-6xl font-bold text-primary mb-4"
          />
          <Typography variant="h6" className="text-text-secondary font-medium tracking-wide uppercase text-sm">
            Admin Management Portal
          </Typography>
        </Box>
        
        <Card className="shadow-2xl border border-violet-100 rounded-3xl overflow-hidden">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />

                <ShimmerButton 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold shadow-lg"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN TO DASHBOARD'}
                </ShimmerButton>

                <Box className="text-center pt-2">
                  <Typography variant="body2" className="text-text-secondary">
                    Don&apos;t have an account?{' '}
                    <Link href="/admin/signup" className="text-primary font-bold no-underline hover:underline transition-all">
                      Register your company
                    </Link>
                  </Typography>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
