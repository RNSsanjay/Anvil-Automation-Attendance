'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Edit, Delete, Search } from '@mui/icons-material';
import useSWR from 'swr';
import { useToast } from '@/components/shared/ToastProvider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EmployeesPage() {
  const { data: employees, mutate } = useSWR('/api/admin/employees', fetcher);
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const filteredEmployees = employees?.filter((emp: any) => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleEdit = (employee: any) => {
    setEditEmployee(employee);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/admin/employees/${deleteConfirm._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Employee deleted successfully', 'success');
        mutate();
      } else {
        showToast('Failed to delete employee', 'error');
      }
    } catch (err) {
      showToast('Error deleting employee', 'error');
    }
    setDeleteConfirm(null);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/admin/employees/${editEmployee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEmployee),
      });
      if (res.ok) {
        showToast('Employee updated successfully', 'success');
        mutate();
        setEditEmployee(null);
      } else {
        showToast('Failed to update employee', 'error');
      }
    } catch (err) {
      showToast('Error updating employee', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { 
      field: 'createdAt', 
      headerName: 'Joined Date', 
      width: 150,
      valueGetter: (params: any) => new Date(params).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small">
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => setDeleteConfirm(params.row)} color="error" size="small">
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box className="space-y-6">
      <Box className="flex justify-between items-center">
        <Typography variant="h4" className="font-bold text-text-primary">
          Employee Management
        </Typography>
        <TextField
          size="small"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <Search className="text-text-secondary mr-2" />,
          }}
          className="bg-white rounded-lg"
          sx={{ width: 300 }}
        />
      </Box>

      <Card className="h-[600px]">
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          getRowId={(row) => row._id}
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

      {/* Edit Dialog */}
      <Dialog open={!!editEmployee} onClose={() => setEditEmployee(null)}>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent className="pt-4 space-y-4">
          <TextField
            fullWidth
            label="Name"
            value={editEmployee?.name || ''}
            onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Phone"
            value={editEmployee?.phone || ''}
            onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            value={editEmployee?.email || ''}
            onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEmployee(null)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete employee <strong>{deleteConfirm?.name}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
