'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Stack, 
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid
} from '@mui/material';
import { 
  Person, 
  Business, 
  LocationOn, 
  Lock, 
  CheckCircle,
  GpsFixed
} from '@mui/icons-material';
import { useToast } from '@/components/shared/ToastProvider';
import ShimmerButton from '@/components/ui/shimmer-button';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
  const { data: admin, mutate, isLoading } = useSWR('/api/admin/profile', fetcher);
  const { showToast } = useToast();
  
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Password state
  const [passModal, setPassModal] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (admin) {
      setCompanyName(admin.companyName);
      setLocation(admin.location);
    }
  }, [admin]);

  const handleGetLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'error');
      setGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        showToast('High-accuracy location captured', 'success');
        setGettingLocation(false);
      },
      () => {
        showToast('Location access denied or timeout', 'error');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, location }),
      });
      if (res.ok) {
        showToast('Profile updated successfully', 'success');
        mutate();
      } else {
        showToast('Update failed', 'error');
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
      const res = await fetch('/api/admin/profile/password', { method: 'POST' });
      if (res.ok) {
        showToast('OTP sent to your email', 'success');
        setOtpStep(true);
      } else {
        showToast('Failed to send OTP', 'error');
      }
    } catch (e) {
      showToast('Error', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    setPassLoading(true);
    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'PATCH',
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

  if (isLoading) return <Box className="p-8 text-center"><CircularProgress /></Box>;

  return (
    <Box className="space-y-8 max-w-4xl">
      <Typography variant="h4" className="font-bold text-text-primary">Admin Profile</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card className="rounded-2xl">
            <CardContent className="p-8">
              <Typography variant="h6" className="font-bold mb-6 flex items-center gap-2">
                <Business className="text-primary" /> Company Settings
              </Typography>
              
              <Stack spacing={4}>
                <TextField 
                  fullWidth
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                
                <Box>
                  <Typography variant="body2" className="text-text-secondary mb-2">Geo-fence Location</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField 
                      disabled
                      size="small"
                      label="Latitude"
                      value={location?.lat?.toFixed(6) || ''}
                    />
                    <TextField 
                      disabled
                      size="small"
                      label="Longitude"
                      value={location?.lng?.toFixed(6) || ''}
                    />
                    <Button 
                      variant="outlined" 
                      startIcon={gettingLocation ? <CircularProgress size={20} /> : <GpsFixed />}
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                    >
                      Update
                    </Button>
                    {location && (
                      <Button 
                        variant="text" 
                        color="secondary"
                        onClick={() => window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank')}
                        className="text-xs"
                      >
                        View on Map
                      </Button>
                    )}
                  </Stack>
                  <Typography variant="caption" className="mt-2 block text-violet-400">
                    This location defines the 100m radius for employee check-ins.
                  </Typography>
                </Box>

                <ShimmerButton 
                  onClick={handleSaveProfile}
                  className="h-12 w-full"
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} color="inherit" /> : 'SAVE CHANGES'}
                </ShimmerButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            <Card className="rounded-2xl">
              <CardContent className="p-8">
                <Typography variant="h6" className="font-bold mb-4 flex items-center gap-2">
                  <Person className="text-primary" /> Account Info
                </Typography>
                <Box className="space-y-4">
                  <Box>
                    <Typography variant="caption" className="text-text-secondary uppercase">Email Address</Typography>
                    <Typography variant="body1" className="font-medium">{admin?.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-text-secondary uppercase">Account Status</Typography>
                    <Box className="flex items-center gap-2 text-green-600 mt-1">
                      <CheckCircle sx={{ fontSize: 16 }} /> <Typography variant="body2">Verified Admin</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-dashed border-2 border-violet-100">
              <CardContent className="p-8">
                <Typography variant="h6" className="font-bold mb-4 flex items-center gap-2">
                  <Lock className="text-primary" /> Security
                </Typography>
                <Typography variant="body2" className="text-text-secondary mb-4">
                  Regularly update your password to maintain account security.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  fullWidth
                  onClick={() => setPassModal(true)}
                >
                  Change Password
                </Button>
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
              For security, we will send a verification code to your registered email <strong>{admin?.email}</strong> before you can change your password.
            </Typography>
          ) : (
            <Stack spacing={3} className="pt-4">
              <TextField 
                fullWidth 
                label="Enter 6-digit OTP" 
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
              {passLoading ? <CircularProgress size={20} /> : 'Send OTP'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleUpdatePassword} disabled={passLoading}>
              {passLoading ? <CircularProgress size={20} /> : 'Update Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
