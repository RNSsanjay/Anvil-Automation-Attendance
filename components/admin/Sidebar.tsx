'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Button 
} from '@mui/material';
import { 
  Dashboard, 
  QrCode, 
  History, 
  Logout, 
  Person 
} from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <Dashboard /> },
  { label: 'Generate QR', path: '/admin/qr', icon: <QrCode /> },
  { label: 'Attendance', path: '/admin/attendance', icon: <History /> },
  { label: 'Profile', path: '/admin/profile', icon: <Person /> },
];

interface SidebarProps {
  onMobileNavigate?: () => void;
}

export default function Sidebar({ onMobileNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    if (onMobileNavigate) onMobileNavigate();
  };

  return (
    <Box className="w-full md:w-64 h-full bg-card border-r border-border flex flex-col p-4 overflow-y-auto">
      <Box className="p-4 mb-8">
        <Typography variant="h5" className="text-primary font-bold">Presenz</Typography>
        <Typography variant="caption" className="text-text-secondary">Attendance System</Typography>
      </Box>

      <List className="flex-grow space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItemButton 
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              selected={isActive}
              className={`rounded-xl relative overflow-hidden transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
              sx={{
                mb: 1,
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(124, 58, 237, 0.15)',
                  }
                }
              }}
            >
              <ListItemIcon className={`min-w-[40px] ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
              
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider className="my-4" />

      <Button 
        fullWidth 
        startIcon={<Logout />} 
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="text-text-secondary hover:text-red-600 hover:bg-red-50 justify-start px-4 py-3 rounded-xl transition-colors"
      >
        Logout
      </Button>
    </Box>
  );
}
