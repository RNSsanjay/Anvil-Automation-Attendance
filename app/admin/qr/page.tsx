'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Container, CircularProgress } from '@mui/material';
import QRDisplay from '@/components/qr/QRDisplay';
import ShimmerButton from '@/components/ui/shimmer-button';
import { ArrowForward } from '@mui/icons-material';

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
    <Box className="min-h-screen bg-white hero-grain flex flex-col items-center justify-center py-12 px-4">
      <Container maxWidth="md" className="flex flex-col items-center gap-12">
        <QRDisplay 
          companyId={admin.companyId} 
          companyName={admin.name} 
        />
        
        <Box className="print:hidden">
          <ShimmerButton 
            onClick={() => router.push('/admin/dashboard')}
            className="px-8 h-12 flex gap-2 items-center"
          >
            Go to Dashboard <ArrowForward sx={{ fontSize: 20 }} />
          </ShimmerButton>
        </Box>
      </Container>
    </Box>
  );
}
