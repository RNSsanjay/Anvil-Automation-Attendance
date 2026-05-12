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
import { format } from 'date-fns';
import { CircularProgress, Chip } from '@mui/material';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: stats, error: statsError } = useSWR('/api/admin/dashboard/stats', fetcher);
  const { data: recentAttendance, isLoading: isLoadingRecent, error: attendanceError } = useSWR('/api/admin/attendance/today', fetcher);

  React.useEffect(() => {
    if (statsError) {
      console.error('Stats fetch error:', statsError);
    }
    if (attendanceError) {
      console.error('Attendance fetch error:', attendanceError);
    }
  }, [statsError, attendanceError]);

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

      {/* Recent Activity Section */}
      <Box className="space-y-4">
        <Box className="flex justify-between items-center">
          <Typography variant="h5" className="font-bold text-text-primary">
            Recent Attendance
          </Typography>
          <Chip 
            label="Daily Limit: 1 Check-In + 1 Check-Out" 
            size="small" 
            variant="outlined"
            color="info"
          />
        </Box>
        <Card className="rounded-2xl overflow-hidden border border-violet-100 shadow-sm">
          <CardContent className="p-0">
            {isLoadingRecent ? (
              <Box className="p-8 text-center"><CircularProgress size={20} /></Box>
            ) : !recentAttendance || recentAttendance.length === 0 ? (
              <Box className="p-12 text-center text-text-secondary">
                <Typography variant="body1">No attendance records yet today.</Typography>
                <Typography variant="caption">Recent check-ins will appear here automatically.</Typography>
              </Box>
            ) : (
              <Box className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Employee</th>
                      <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Time</th>
                      <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.slice(0, 5).map((record: any) => (
                      <tr key={record._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <Typography variant="subtitle2" className="font-semibold">{record.employeeName}</Typography>
                          <Typography variant="caption" className="text-text-secondary">
                            {record.employeeEmail || 'No email provided'}
                          </Typography>
                        </td>
                        <td className="p-4 text-text-secondary">
                          {format(new Date(record.checkInTime), 'hh:mm aa')}
                          {record.checkOutTime && (
                            <>
                              <br />
                              <span className="text-green-600">{format(new Date(record.checkOutTime), 'hh:mm aa')}</span>
                            </>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Chip 
                            label={record.status === 'checked-out' ? 'Checked Out' : 'Checked In'} 
                            size="small" 
                            color={record.status === 'checked-out' ? 'success' : 'primary'} 
                            variant="outlined" 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
