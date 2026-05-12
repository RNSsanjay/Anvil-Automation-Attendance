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
  Chip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { History, Refresh, AccountCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TodayAttendancePage() {
  const router = useRouter();
  const { data: attendance, mutate, isLoading } = useSWR('/api/admin/attendance/today', fetcher, {
    refreshInterval: 30000, // Polling every 30s
  });

  const columns: GridColDef[] = [
    { field: 'companyName', headerName: 'Company', width: 150 },
    { 
      field: 'checkInPhoto', 
      headerName: 'Verification Photo', 
      width: 150,
      renderCell: (params) => (
        <Box className="p-1">
          {params.value ? (
            <img 
              src={params.value} 
              alt="Verification" 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
              onClick={() => window.open(params.value, '_blank')}
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
      headerName: 'Check-in Time', 
      width: 180,
      valueGetter: (params: any) => params ? format(new Date(params), 'hh:mm:ss aa') : 'N/A'
    },
    {
      field: 'verificationMethod',
      headerName: 'Method',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Face'} 
          size="small" 
          variant="outlined" 
          color={params.value === 'biometric' ? 'primary' : 'secondary'}
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
