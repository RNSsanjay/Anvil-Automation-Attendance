'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography, CircularProgress, Button, Card } from '@mui/material';
import { LocationOn, GpsFixed } from '@mui/icons-material';
import { haversineDistance } from '@/lib/geofence';
import { useToast } from '@/components/shared/ToastProvider';

export default function ScanLanding() {
  const router = useRouter();
  const { companyId } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkLocation = React.useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          const res = await fetch(`/api/admin/qr?companyId=${companyId}`);
          if (!res.ok) throw new Error('Company not found');
          
          const company = await res.json();
          const distance = haversineDistance(
            userLat, userLng,
            company.location.lat, company.location.lng
          );

          if (distance <= 100) {
            router.push(`/checkin/${companyId}`);
          } else {
            localStorage.setItem('lastDistance', Math.round(distance).toString());
            localStorage.setItem('lastCompanyName', company.companyName);
            localStorage.setItem('lastCompanyLocation', JSON.stringify(company.location));
            router.push('/out-of-range');
          }
        } catch (err) {
          setError('Failed to verify location with company data.');
          setLoading(false);
        }
      },
      (geoError) => {
        setError('Location access is required to mark attendance. Please enable location in your browser settings.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [companyId, router]);

  useEffect(() => {
    checkLocation();
  }, [checkLocation]);

  if (error) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="max-w-sm w-full text-center p-8">
          <LocationOn className="text-red-500 text-6xl mb-4" />
          <Typography variant="h5" className="font-bold mb-4">Location Required</Typography>
          <Typography variant="body2" className="text-text-secondary mb-8">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={checkLocation}
            startIcon={<GpsFixed />}
          >
            Retry Location Access
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <CircularProgress size={64} thickness={4} className="text-primary mb-8" />
      <Typography variant="h5" className="font-bold text-text-primary animate-pulse">
        Verifying Location...
      </Typography>
      <Typography variant="body2" className="text-text-secondary mt-2">
        Please wait while we verify your geo-fence status for attendance.
      </Typography>
    </Box>
  );
}
