'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Chip
} from '@mui/material';
import ShimmerButton from '@/components/ui/shimmer-button';
import { useToast } from '@/components/shared/ToastProvider';

const checkinSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
});

type CheckinForm = z.infer<typeof checkinSchema>;

export default function CheckinPage() {
  const router = useRouter();
  const { companyId } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [fetchingUser, setFetchingUser] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckinForm>({
    resolver: zodResolver(checkinSchema),
  });

  const email = watch('email');
  const phone = watch('phone');

  useEffect(() => {
    fetch(`/api/admin/qr?companyId=${companyId}`)
      .then(res => res.json())
      .then(data => setCompanyName(data.companyName))
      .catch(() => setCompanyName('Anvil Automation'));
  }, [companyId]);

  useEffect(() => {
    if ((email && email.includes('@')) || (phone && phone.length >= 10)) {
      const timer = setTimeout(async () => {
        setFetchingUser(true);
        try {
          const res = await fetch(`/api/employee/info?companyId=${companyId}&email=${email}&phone=${phone}`);
          if (res.ok) {
            const data = await res.json();
            if (data.name) {
              setValue('name', data.name);
              showToast(`Welcome back, ${data.name}!`, 'info');
            }
          }
        } catch (err) {
          // Ignore errors for auto-fill
        } finally {
          setFetchingUser(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [email, phone, companyId, setValue, showToast]);

  const onSubmit = async (data: CheckinForm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/employee/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          companyId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Check-in successful!', 'success');
        localStorage.setItem('lastCheckinName', data.name);
        localStorage.setItem('lastCheckinTime', new Date().toISOString());
        localStorage.setItem('lastCheckinCompany', companyName);
        router.push('/thankyou');
      } else {
        showToast(result.message || 'Check-in failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-white hero-grain p-4">
      <Container maxWidth="sm">
        <Box className="text-center mb-8">
          <Chip 
            label={companyName || 'Loading...'} 
            className="bg-violet-50 text-primary font-bold border-violet-200 mb-4 px-2 py-4 h-auto text-lg" 
          />
          <Typography variant="h3" className="text-text-primary mb-2 text-balance">Employee Check-in</Typography>
          <Typography variant="body1" className="text-text-secondary">Please fill in your details to mark attendance</Typography>
        </Box>
        
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box className="space-y-6">
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />

                <Box className="relative">
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                  {fetchingUser && (
                    <CircularProgress size={20} className="absolute right-3 top-4" />
                  )}
                </Box>

                <ShimmerButton 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'CHECK IN'}
                </ShimmerButton>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
