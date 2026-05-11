'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent 
} from '@mui/material';
import { 
  People, 
  CheckCircle, 
  Cancel, 
  Timeline 
} from '@mui/icons-material';
import StatCard from '@/components/admin/StatCard';
import { Meteors } from '@/components/ui/meteors';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: stats, error } = useSWR('/api/admin/dashboard/stats', fetcher);

  const adminName = session?.user?.name || 'Admin';

  return (
    <Box className="space-y-8">
      {/* Hero Section */}
      <Card className="relative overflow-hidden bg-primary text-white p-8 rounded-2xl min-h-[200px] flex flex-col justify-center">
        <Meteors number={20} />
        <Box className="relative z-10">
          <Typography variant="h3" className="font-bold mb-2">
            Welcome back, {adminName}!
          </Typography>
          <Typography variant="body1" className="opacity-90">
            Here&apos;s what&apos;s happening with your company&apos;s attendance today.
          </Typography>
        </Box>
      </Card>

      {/* Stats Row */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="Total Employees" 
            value={stats?.totalEmployees || 0} 
            icon={<People />} 
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="Present Today" 
            value={stats?.presentToday || 0} 
            icon={<CheckCircle />} 
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="Absent Today" 
            value={stats?.absentToday || 0} 
            icon={<Cancel />} 
            delay={0.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="This Month" 
            value={`${stats?.monthlyRate || 0}%`} 
            icon={<Timeline />} 
            delay={0.4}
          />
        </Grid>
      </Grid>

      {/* Recent Activity Table (Placeholder) */}
      <Box>
        <Typography variant="h5" className="font-bold mb-4 text-text-primary">
          Recent Attendance
        </Typography>
        <Card>
          <CardContent className="p-0">
             <Box className="p-8 text-center text-text-secondary">
               Attendance records will appear here as employees check in.
             </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
