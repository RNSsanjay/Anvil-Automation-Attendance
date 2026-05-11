'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <Box className="flex h-screen bg-white">
      <Sidebar />
      <Box className="flex-grow overflow-auto p-8">
        {children}
      </Box>
    </Box>
  );
}
