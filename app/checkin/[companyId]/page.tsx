'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Card, 
  CardContent, 
  Stack,
  CircularProgress,
  Paper,
  Fade,
  LinearProgress
} from '@mui/material';
import { 
  AccountCircle,
  Phone,
  Email,
  CheckCircle,
  LocationOn
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/shared/ToastProvider';
import Webcam from 'react-webcam';
import { getISTTime } from '@/lib/ist';

export default function CheckinPage() {
  const { companyId } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const webcamRef = useRef<Webcam>(null);

  const [step, setStep] = useState<'verifying-location' | 'details' | 'face-scan' | 'processing'>('verifying-location');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [companyName, setCompanyName] = useState('');

  // Check location on mount
  useEffect(() => {
    verifyLocation();
  }, []);

  // Check if user credentials are still valid (same month)
  useEffect(() => {
    const savedEmail = localStorage.getItem('presenz_user_email');
    const savedName = localStorage.getItem('presenz_user_name');
    const savedPhone = localStorage.getItem('presenz_user_phone');
    const savedMonth = localStorage.getItem('presenz_credentials_month');
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    if (savedEmail && savedName && savedPhone && savedMonth === currentMonth) {
      // Credentials are valid for this month
      setFormData({ email: savedEmail, name: savedName, phone: savedPhone });
      setIsRegistered(true);
    } else if (savedMonth && savedMonth !== currentMonth) {
      // New month - clear old credentials
      localStorage.removeItem('presenz_user_email');
      localStorage.removeItem('presenz_user_name');
      localStorage.removeItem('presenz_user_phone');
      localStorage.removeItem('presenz_credentials_month');
      setIsRegistered(false);
    }
  }, []);

  const verifyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLocation({ lat: userLat, lng: userLng });

        try {
          const res = await fetch(`/api/admin/qr?companyId=${companyId}`);
          if (!res.ok) {
            showToast('Company not found', 'error');
            return;
          }
          
          const company = await res.json();
          setCompanyName(company.companyName);

          // Calculate distance
          const distance = haversineDistance(
            userLat, userLng,
            company.location.lat, company.location.lng
          );

          if (distance <= 100) {
            // Location verified, proceed to next step
            setStep(isRegistered ? 'face-scan' : 'details');
          } else {
            localStorage.setItem('lastDistance', Math.round(distance).toString());
            localStorage.setItem('lastCompanyName', company.companyName);
            localStorage.setItem('lastCompanyLocation', JSON.stringify(company.location));
            router.push('/out-of-range');
          }
        } catch (err) {
          showToast('Failed to verify location', 'error');
        }
      },
      (error) => {
        showToast('Location access required for attendance', 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [companyId, router, showToast, isRegistered]);

  // Haversine distance calculation
  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Please enter your name and phone number', 'warning');
      return;
    }
    setStep('face-scan');
  };

  // Auto-capture 5 photos when face detected
  const startAutoCapture = useCallback(async () => {
    if (!webcamRef.current || isCapturing) return;
    
    setIsCapturing(true);
    setCapturedPhotos([]);
    setCaptureProgress(0);
    const photos: string[] = [];
    
    showToast('Keep your face steady...', 'info');

    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 400)); // 400ms between captures
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        photos.push(imageSrc);
        setCapturedPhotos(prev => [...prev, imageSrc]);
        setCaptureProgress(((i + 1) / 5) * 100);
      }
    }

    setIsCapturing(false);
    
    if (photos.length === 5) {
      await handleCheckin(photos);
    } else {
      showToast('Failed to capture photos. Please try again.', 'error');
      setCapturedPhotos([]);
      setCaptureProgress(0);
    }
  }, [isCapturing]);

  const handleCheckin = useCallback(async (facePhotos: string[]) => {
    setStep('processing');
    try {
      const response = await fetch('/api/employee/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          ...formData,
          location,
          facePhotos
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Store user data for the current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        localStorage.setItem('presenz_user_email', formData.email || '');
        localStorage.setItem('presenz_user_name', formData.name);
        localStorage.setItem('presenz_user_phone', formData.phone);
        localStorage.setItem('presenz_credentials_month', currentMonth);
        localStorage.setItem('lastCheckinName', result.employeeName);
        localStorage.setItem('lastCheckinCompany', result.companyName);
        
        // Handle different response types
        if (result.alreadyComplete) {
          // Already completed both check-in and check-out
          localStorage.setItem('lastCheckinTime', result.checkInTime);
          localStorage.setItem('lastCheckoutTime', result.checkOutTime);
          localStorage.setItem('lastCheckinType', 'complete');
          localStorage.setItem('lastCheckinDetail', result.detail || '');
        } else if (result.isCheckOut) {
          // Just checked out
          localStorage.setItem('lastCheckinTime', result.checkInTime || '');
          localStorage.setItem('lastCheckoutTime', result.checkOutTime);
          localStorage.setItem('lastCheckinType', 'check-out');
        } else {
          // Just checked in
          localStorage.setItem('lastCheckinTime', result.checkInTime);
          localStorage.setItem('lastCheckinType', 'check-in');
        }
        
        showToast(result.message, 'success');
        router.push('/thankyou');
      } else {
        showToast(result.message || 'Verification failed', 'error');
        setStep('face-scan');
        setCapturedPhotos([]);
        setCaptureProgress(0);
      }
    } catch (err) {
      showToast('Network error during verification', 'error');
      setStep('face-scan');
      setCapturedPhotos([]);
      setCaptureProgress(0);
    }
  }, [companyId, formData, location, router, showToast]);

  return (
    <Box className="min-h-screen bg-slate-50 flex items-center justify-center p-4 hero-grain">
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Card className="rounded-3xl shadow-2xl overflow-hidden border border-white">
            <Box className="bg-primary p-6 text-white text-center relative overflow-hidden">
              <Box className="relative z-10">
                <Typography variant="h4" className="font-bold">
                  {companyName || 'Attendance System'}
                </Typography>
                <Typography variant="body2" className="opacity-80">
                  {getISTTime()} • Face Recognition
                </Typography>
              </Box>
              <Box className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </Box>

            <CardContent className="p-8">
              {step === 'verifying-location' && (
                <Box className="text-center space-y-4">
                  <CircularProgress size={64} thickness={4} className="text-primary" />
                  <Typography variant="h6" className="font-semibold">
                    Verifying Location...
                  </Typography>
                  <Typography variant="body2" className="text-text-secondary">
                    Please wait while we check your geo-fence status
                  </Typography>
                </Box>
              )}

              {step === 'details' && (
                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                  <Box className="mb-4">
                    <Typography variant="h6" className="font-semibold text-text-primary mb-2">
                      Employee Registration
                    </Typography>
                    <Paper className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <Typography variant="caption" className="text-blue-700">
                        ℹ️ Enter your details once per month. From tomorrow, only face scan will be required for attendance.
                      </Typography>
                    </Paper>
                  </Box>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      InputProps={{ startAdornment: <AccountCircle className="mr-2 text-primary" /> }}
                    />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      InputProps={{ startAdornment: <Phone className="mr-2 text-primary" /> }}
                    />
                    <TextField
                      fullWidth
                      label="Email Address (Optional)"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      InputProps={{ startAdornment: <Email className="mr-2 text-primary" /> }}
                      helperText="Email is optional but recommended for notifications"
                    />
                  </Stack>

                  <Paper variant="outlined" className="p-4 bg-green-50 border-green-200 rounded-xl mt-6">
                    <Box className="flex items-center gap-2 text-green-700">
                      <LocationOn />
                      <Typography variant="body2">
                        Location Verified ✓
                      </Typography>
                    </Box>
                  </Paper>

                  <button
                    type="submit"
                    className="w-full h-14 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                  >
                    Continue to Face Scan
                  </button>
                </form>
              )}

              {step === 'face-scan' && (
                <Box className="space-y-6">
                  <Typography variant="h6" className="font-semibold text-text-primary text-center">
                    {isRegistered ? `Welcome Back, ${formData.name}!` : 'Face Registration'}
                  </Typography>
                  
                  {isRegistered && (
                    <Paper className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                      <Typography variant="body2" className="text-green-700 text-center font-semibold">
                        ✓ Credentials valid until end of {new Date().toLocaleString('default', { month: 'long' })}
                      </Typography>
                      <Typography variant="caption" className="text-green-600 text-center block mt-1">
                        Just scan your face to mark attendance
                      </Typography>
                    </Paper>
                  )}
                  
                  {!isRegistered && (
                    <Paper className="p-3 bg-violet-50 border border-violet-200 rounded-xl mb-4">
                      <Typography variant="caption" className="text-violet-700 text-center block">
                        📸 First time this month? Your face will be registered for the entire month
                      </Typography>
                    </Paper>
                  )}

                  <Paper className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                    <Typography variant="caption" className="text-blue-700 text-center block font-semibold">
                      ℹ️ Daily Limit: 1 Check-In + 1 Check-Out
                    </Typography>
                    <Typography variant="caption" className="text-blue-600 text-center block text-xs mt-1">
                      First scan = Check-In • Second scan = Check-Out
                    </Typography>
                  </Paper>
                  
                  <Box className="relative rounded-2xl overflow-hidden bg-black">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: 'user',
                        width: 640,
                        height: 480
                      }}
                      className="w-full h-auto"
                    />
                    
                    {captureProgress > 0 && (
                      <Box className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                        <Typography variant="body2" className="text-white text-center mb-2">
                          Capturing: {Math.round(captureProgress)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={captureProgress} 
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#7C3AED'
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {capturedPhotos.length > 0 && (
                    <Box className="flex gap-2 justify-center overflow-x-auto py-2">
                      {capturedPhotos.map((photo, idx) => (
                        <img 
                          key={idx}
                          src={photo} 
                          alt={`Capture ${idx + 1}`}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-primary"
                        />
                      ))}
                    </Box>
                  )}

                  {!isCapturing && capturedPhotos.length === 0 && (
                    <button
                      onClick={startAutoCapture}
                      className="w-full h-14 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle />
                      Start Face Scan
                    </button>
                  )}

                  {isCapturing && (
                    <Paper className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
                      <Typography variant="body2" className="text-center text-violet-700">
                        📸 Capturing your face from multiple angles...
                        <br />
                        Please keep your face steady
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}

              {step === 'processing' && (
                <Box className="text-center space-y-4 py-8">
                  <CircularProgress size={64} thickness={4} className="text-primary" />
                  <Typography variant="h6" className="font-semibold">
                    Processing Attendance...
                  </Typography>
                  <Typography variant="body2" className="text-text-secondary">
                    Verifying your face and marking attendance
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}
