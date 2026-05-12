'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  CircularProgress,
  Stack,
  Grid,
  Divider,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Person, 
  Business, 
  LocationOn, 
  Lock, 
  CheckCircle,
  GpsFixed,
  Map,
  Dashboard
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import nextDynamic from 'next/dynamic';
import { useToast } from '@/components/shared/ToastProvider';
import ShimmerButton from '@/components/ui/shimmer-button';

const MapPicker = nextDynamic(() => import('@/components/shared/MapPicker'), { 
  ssr: false,
  loading: () => <Box className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed"><CircularProgress size={20} /></Box>
});

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { showToast } = useToast();
  
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Password State
  const [passModal, setPassModal] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchProfile() {
      try {
        const res = await fetch('/api/admin/profile');
        const data = await res.json();
        if (res.ok) {
          setCompanyName(data.companyName || '');
          if (data.location) {
            setLocation(data.location);
          }
        }
      } catch (e) {
        showToast('Failed to load profile', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [showToast]);

  const handleGetLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ 
          lat: parseFloat(pos.coords.latitude.toFixed(6)), 
          lng: parseFloat(pos.coords.longitude.toFixed(6)) 
        });
        setAccuracy(pos.coords.accuracy);
        setGettingLocation(false);
        showToast('Location captured successfully', 'success');
      },
      (err) => {
        showToast('Permission denied or timeout', 'error');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSaveProfile = async () => {
    if (!companyName) {
      showToast('Company name is required', 'error');
      return;
    }
    if (!location) {
      showToast('Please set a location for geo-fencing', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, location }),
      });
      if (res.ok) {
        showToast('Profile updated successfully', 'success');
        await update();
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (e) {
      showToast('Error saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestOtp = async () => {
    setPassLoading(true);
    try {
      const res = await fetch('/api/admin/profile/password/otp', { method: 'POST' });
      if (res.ok) {
        setOtpStep(true);
        showToast('Verification code sent to your email', 'success');
      } else {
        showToast('Failed to send code', 'error');
      }
    } catch (e) {
      showToast('Error', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (otpCode.length !== 6) {
      showToast('Enter a valid 6-digit code', 'error');
      return;
    }
    setPassLoading(true);
    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpCode, newPassword }),
      });
      if (res.ok) {
        showToast('Password changed successfully', 'success');
        setPassModal(false);
        setOtpStep(false);
        setNewPassword('');
        setOtpCode('');
      } else {
        showToast('Invalid or expired OTP', 'error');
      }
    } catch (e) {
      showToast('Error', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  if (!mounted) return null;
  if (isLoading) return <Box className="p-8 text-center"><CircularProgress /></Box>;

  return (
    <Box className="space-y-8 max-w-6xl mx-auto">
      <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Box>
          <Typography variant="h4" className="font-bold text-text-primary">Admin Profile</Typography>
          <Typography variant="body2" className="text-text-secondary">Manage your company workspace and geo-fencing</Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card className="rounded-3xl shadow-sm border border-violet-100 overflow-hidden">
            <Box className="bg-primary/5 p-6 border-b border-primary/10">
               <Typography variant="h6" className="font-bold flex items-center gap-2 text-primary">
                 <Business /> Company Identity
               </Typography>
            </Box>
            <CardContent className="p-8 space-y-8">
              <TextField 
                fullWidth
                label="Company Name"
                variant="outlined"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              
              <Divider />

              <Box className="space-y-4">
                <Box className="flex justify-between items-center">
                  <Typography variant="subtitle1" className="font-bold flex items-center gap-2">
                    <LocationOn className="text-secondary" /> Geo-fencing Configuration
                  </Typography>
                  {location && (
                    <Button 
                      size="small" 
                      onClick={() => window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank')}
                      className="text-primary font-bold"
                    >
                      Verify on Google Maps
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" className="p-4 bg-slate-50/50 rounded-xl">
                      <Typography variant="caption" className="text-text-secondary uppercase font-bold tracking-wider">Latitude</Typography>
                      <Typography variant="h6" className="font-mono">{location?.lat?.toFixed(6) || 'Not set'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" className="p-4 bg-slate-50/50 rounded-xl">
                      <Typography variant="caption" className="text-text-secondary uppercase font-bold tracking-wider">Longitude</Typography>
                      <Typography variant="h6" className="font-mono">{location?.lng?.toFixed(6) || 'Not set'}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    startIcon={gettingLocation ? <CircularProgress size={20} color="inherit" /> : <GpsFixed />}
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="h-12 rounded-xl"
                  >
                    Auto-Capture GPS
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    color="secondary"
                    startIcon={<Map />}
                    onClick={() => setMapOpen(true)}
                    className="h-12 rounded-xl border-2 hover:border-2"
                  >
                    Select on Map
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
                  initialLocation={location}
                />
                
                {accuracy && (
                  <Chip 
                    label={`Current Precision: ±${Math.round(accuracy)} meters`} 
                    size="small" 
                    color={accuracy < 30 ? "success" : "warning"}
                    className="font-bold py-4 rounded-lg w-full"
                    variant="filled"
                  />
                )}
              </Box>

              <ShimmerButton 
                onClick={handleSaveProfile}
                className="h-14 w-full shadow-lg shadow-primary/20"
                disabled={saving}
              >
                {saving ? 'Saving Workspace...' : 'Update Profile Settings'}
              </ShimmerButton>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            <Card className="rounded-3xl border border-violet-100 shadow-sm">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-bold mb-4 flex items-center gap-2">
                  <Person className="text-primary" /> Admin Info
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" className="text-text-secondary uppercase">Email</Typography>
                    <Typography variant="body1" className="font-medium">{session?.user?.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-text-secondary uppercase">Status</Typography>
                    <Box className="flex items-center gap-2 text-green-600 mt-1">
                      <CheckCircle sx={{ fontSize: 16 }} /> <Typography variant="body2" className="font-bold">Verified Admin</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<Lock />}
                    onClick={() => setPassModal(true)}
                    className="rounded-xl"
                  >
                    Change Password
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Password Dialog */}
      <Dialog open={passModal} onClose={() => !passLoading && setPassModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold">Change Password</DialogTitle>
        <DialogContent>
          {!otpStep ? (
            <Typography variant="body2" className="py-2">
              For security, we will send a verification code to your registered email before you can change your password.
            </Typography>
          ) : (
            <Stack spacing={3} className="pt-4">
              <TextField 
                fullWidth 
                label="6-digit code" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <TextField 
                fullWidth 
                type="password"
                label="New Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions className="p-6">
          <Button onClick={() => setPassModal(false)} disabled={passLoading}>Cancel</Button>
          {!otpStep ? (
            <Button variant="contained" onClick={handleRequestOtp} disabled={passLoading}>
              {passLoading ? <CircularProgress size={20} color="inherit" /> : 'Send OTP'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleUpdatePassword} disabled={passLoading}>
              {passLoading ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
