'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { LocationOn, GpsFixed } from '@mui/icons-material';
import ShimmerButton from '@/components/ui/shimmer-button';
import { useToast } from '@/components/shared/ToastProvider';
import SparklesText from '@/components/ui/sparkles-text';

import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/shared/MapPicker'), { 
  ssr: false,
  loading: () => <CircularProgress size={20} />
});

const signupSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function AdminSignup() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const handleGetLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setLocation({ 
          lat: latitude, 
          lng: longitude 
        });
        showToast(`High-accuracy location captured (±${Math.round(acc)}m)`, acc < 50 ? 'success' : 'warning');
        setGettingLocation(false);
      },
      (error) => {
        showToast('Location access is required for geo-fencing', 'error');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const onSubmit = async (data: SignupForm) => {
    if (!location) {
      showToast('Please capture your company location first', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          location,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Signup successful! Check your email for OTP.', 'success');
        localStorage.setItem('pendingVerifyEmail', data.email);
        router.push('/verify-email');
      } else {
        showToast(result.message || 'Signup failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-white hero-grain p-4">
      <Container maxWidth="sm">
        <Box className="text-center mb-10">
          <SparklesText 
            text="Join Presenz" 
            className="text-4xl md:text-6xl font-bold text-primary mb-4"
          />
          <Typography variant="h6" className="text-text-secondary font-medium tracking-wide uppercase text-sm">
            Set up your company workspace
          </Typography>
        </Box>
        
        <Card className="shadow-2xl border border-violet-100 rounded-3xl overflow-hidden">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Company Name"
                  {...register('companyName')}
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                
                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Confirm"
                    type="password"
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Stack>

                <Box className="flex flex-col items-center gap-4 py-2">
                  <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={gettingLocation ? <CircularProgress size={20} /> : <GpsFixed />}
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                      className="flex-grow"
                      sx={{ borderRadius: '12px', height: '56px', borderWidth: '2px' }}
                    >
                      Capture GPS
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      startIcon={<LocationOn />}
                      onClick={() => setMapOpen(true)}
                      className="flex-grow"
                      sx={{ borderRadius: '12px', height: '56px', borderWidth: '2px' }}
                    >
                      Pick on Map
                    </Button>
                  </Stack>

                  <MapPicker 
                    open={mapOpen} 
                    onClose={() => setMapOpen(false)}
                    onSelect={(lat, lng) => {
                      setLocation({ 
                        lat: parseFloat(lat.toFixed(6)), 
                        lng: parseFloat(lng.toFixed(6)) 
                      });
                      showToast('Location selected from map', 'success');
                    }}
                    initialLocation={location || undefined}
                  />
                  
                  {location && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={`📍 Captured: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                        className="bg-green-50 text-green-700 border-green-200 font-bold"
                      />
                      <Button 
                        size="small" 
                        color="secondary"
                        onClick={() => window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank')}
                      >
                        Verify on Map
                      </Button>
                    </Stack>
                  )}
                </Box>

                <ShimmerButton 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold shadow-lg"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'CREATE WORKSPACE'}
                </ShimmerButton>

                <Box className="text-center pt-2">
                  <Typography variant="body2" className="text-text-secondary">
                    Already have an account?{' '}
                    <Button 
                      onClick={() => router.push('/admin/login')}
                      className="text-primary font-bold normal-case p-0 min-w-0"
                    >
                      Login here
                    </Button>
                  </Typography>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Box className="mt-8 text-center">
          <Typography variant="caption" className="text-text-secondary font-medium">
            &copy; {new Date().getFullYear()} Presenz • Powered by <strong>RNS Solutions</strong>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
