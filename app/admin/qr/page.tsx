'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Container, CircularProgress, Typography, Card, CardContent, Stack, Button } from '@mui/material';
import QRDisplay from '@/components/qr/QRDisplay';
import ShimmerButton from '@/components/ui/shimmer-button';
import { ArrowForward, Print, Dashboard } from '@mui/icons-material';

export default function QRPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-white">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!session) {
    router.push('/admin/login');
    return null;
  }

  const admin = session.user as any;

  return (
    <Box className="space-y-8">
      <Box>
        <Typography variant="h4" className="font-bold text-text-primary">Company QR Code</Typography>
        <Typography variant="body2" className="text-text-secondary">Display or print this QR at your office entrance</Typography>
      </Box>

      <Box className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="rounded-3xl shadow-xl overflow-hidden border border-white flex-shrink-0">
          <CardContent className="p-0">
            <QRDisplay 
              companyId={admin.companyId} 
              companyName={admin.name} 
            />
          </CardContent>
        </Card>

        <Box className="space-y-6 flex-grow">
          <Card className="rounded-2xl border border-violet-100 bg-violet-50/30">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">How to use</Typography>
              <Stack spacing={2}>
                <Typography variant="body2" className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs">1</span>
                  Print this QR code and place it at your office entry point.
                </Typography>
                <Typography variant="body2" className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs">2</span>
                  Employees scan this QR using their mobile phones.
                </Typography>
                <Typography variant="body2" className="flex gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs">3</span>
                  Our system verifies their location (within 100m) and face.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Box className="print:hidden flex gap-4">
            <Button 
              variant="contained" 
              size="large"
              onClick={() => window.print()}
              startIcon={<Print />}
              className="h-12 rounded-xl"
            >
              Print QR Code
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => router.push('/admin/dashboard')}
              startIcon={<Dashboard />}
              className="h-12 rounded-xl"
            >
              Dashboard
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
