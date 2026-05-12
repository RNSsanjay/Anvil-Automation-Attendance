'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FileDownload, Warning } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useSWR from 'swr';
import { format } from 'date-fns';
import { useToast } from '@/components/shared/ToastProvider';
import { exportToPDF, exportToExcel, exportToWord } from '@/lib/export';
import { useSession } from 'next-auth/react';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export default function HistoryPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [exportModal, setExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const monthStr = selectedMonth ? format(selectedMonth, 'yyyy-MM') : '';
  const { data: attendance, mutate, isLoading, error } = useSWR(
    monthStr ? `/api/admin/attendance/history?month=${monthStr}` : null, 
    fetcher
  );

  React.useEffect(() => {
    if (error) {
      console.error('History fetch error:', error);
      showToast('Failed to load attendance history', 'error');
    }
  }, [error, showToast]);

  const handleExport = async (formatType: 'pdf' | 'excel' | 'word') => {
    if (!attendance || attendance.length === 0) {
      showToast('No records to export', 'warning');
      return;
    }

    setExporting(true);
    try {
      const companyName = session?.user?.name || 'Company';
      const monthName = format(selectedMonth!, 'MMMM');
      const year = format(selectedMonth!, 'yyyy');
      
      let blob;
      let filename = `Anvil_Attendance_${monthName}_${year}`;

      if (formatType === 'pdf') {
        blob = exportToPDF(attendance, companyName, monthName, year);
        filename += '.pdf';
      } else if (formatType === 'excel') {
        blob = exportToExcel(attendance, companyName, monthName, year);
        filename += '.xlsx';
      } else {
        blob = await exportToWord(attendance, companyName, monthName, year);
        filename += '.docx';
      }

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      // Call API to delete records
      const response = await fetch('/api/admin/attendance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: monthStr }),
      });

      if (response.ok) {
        showToast(`Attendance for ${monthName} exported and cleared`, 'success');
        mutate([]);
        setExportModal(false);
      } else {
        showToast('Export successful but failed to clear records', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'employeeName', headerName: 'Employee Name', flex: 1 },
    { 
      field: 'employeeEmail', 
      headerName: 'Email', 
      flex: 1,
      valueGetter: (params: any) => params || 'Not provided'
    },
    { field: 'date', headerName: 'Date', width: 120 },
    { 
      field: 'checkInTime', 
      headerName: 'Check-In', 
      width: 120,
      valueGetter: (params: any) => format(new Date(params), 'hh:mm aa')
    },
    { 
      field: 'checkOutTime', 
      headerName: 'Check-Out', 
      width: 120,
      valueGetter: (params: any) => params ? format(new Date(params), 'hh:mm aa') : '-'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'checked-out' ? 'Complete' : 'Checked In'} 
          size="small" 
          color={params.value === 'checked-out' ? 'success' : 'warning'}
        />
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="space-y-6">
        <Box className="flex justify-between items-center">
          <Typography variant="h4" className="font-bold text-text-primary">
            Attendance History
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <DatePicker
              label="Select Month"
              views={['year', 'month']}
              value={selectedMonth}
              onChange={(newValue) => setSelectedMonth(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button 
              variant="contained" 
              startIcon={<FileDownload />} 
              onClick={() => setExportModal(true)}
              disabled={!attendance || attendance.length === 0}
              color="secondary"
            >
              Export & Clear
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
            }}
          />
        </Card>

        {/* Export Confirmation Dialog */}
        <Dialog open={exportModal} onClose={() => setExportModal(false)}>
          <DialogTitle className="flex items-center gap-2">
            <Warning color="warning" /> Confirm Export & Clear
          </DialogTitle>
          <DialogContent>
            <Typography className="mb-4">
              This will export and <strong>permanently remove</strong> {format(selectedMonth || new Date(), 'MMMM yyyy')} attendance records from the database. 
              Employee data will be preserved.
            </Typography>
            <Typography variant="body2" className="text-text-secondary">
              Choose your export format:
            </Typography>
          </DialogContent>
          <DialogActions className="p-6 justify-center gap-4">
            <Button 
              variant="outlined" 
              onClick={() => handleExport('pdf')} 
              disabled={exporting}
            >
              PDF
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleExport('excel')} 
              disabled={exporting}
            >
              Excel
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleExport('word')} 
              disabled={exporting}
            >
              Word
            </Button>
            {exporting && <CircularProgress size={24} />}
          </DialogActions>
          <DialogActions>
            <Button onClick={() => setExportModal(false)} disabled={exporting}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
