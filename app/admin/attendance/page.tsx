'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { History, Refresh, AccountCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export default function TodayAttendancePage() {
  const router = useRouter();
  const { data: attendance, mutate, isLoading, error } = useSWR('/api/admin/attendance/today', fetcher, {
    refreshInterval: 30000, // Polling every 30s
  });

  React.useEffect(() => {
    if (error) {
      console.error('Attendance fetch error:', error);
    }
  }, [error]);

  const columns: GridColDef[] = [
    { field: 'companyName', headerName: 'Company', width: 150 },
    { 
      field: 'checkInPhotos', 
      headerName: 'Photo', 
      width: 100,
      renderCell: (params) => (
        <Box className="p-1">
          {params.value && params.value[0] ? (
            <img 
              src={params.value[0]} 
              alt="Verification" 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 cursor-pointer"
              onClick={() => window.open(params.value[0], '_blank')}
            />
          ) : (
            <AccountCircle className="text-gray-300" />
          )}
        </Box>
      )
    },
    { field: 'employeeName', headerName: 'Employee Name', flex: 1 },
    { 
      field: 'checkInTime', 
      headerName: 'Check-In Time', 
      width: 150,
      valueGetter: (params: any) => params ? format(new Date(params), 'hh:mm:ss aa') : 'N/A'
    },
    { 
      field: 'checkOutTime', 
      headerName: 'Check-Out Time', 
      width: 150,
      valueGetter: (params: any) => params ? format(new Date(params), 'hh:mm:ss aa') : '-'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'checked-out' ? 'Checked Out' : 'Checked In'} 
          size="small" 
          color={params.value === 'checked-out' ? 'success' : 'primary'}
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Box className="space-y-6">
      <Box className="flex justify-between items-center">
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h4" className="font-bold text-text-primary">
            Today&apos;s Attendance
          </Typography>
          <Typography variant="body2" className="text-text-secondary bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
            {format(new Date(), 'MMMM dd, yyyy')}
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={() => mutate()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<History />} 
            onClick={() => router.push('/admin/attendance/history')}
          >
            See History
          </Button>
        </Stack>
      </Box>

      <Paper className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Typography variant="caption" className="text-blue-700 font-semibold">
          ℹ️ System Rule: Each employee can check-in once and check-out once per day
        </Typography>
      </Paper>

      <Card className="h-[600px]">
        <DataGrid
          rows={attendance || []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          }}
        />
      </Card>
    </Box>
  );
}
