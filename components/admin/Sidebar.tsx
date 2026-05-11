'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  Divider,
  Button
} from '@mui/material';
import { 
  Dashboard, 
  People, 
  Assignment, 
  QrCode, 
  Logout 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <Dashboard /> },
  { label: 'Employees', path: '/admin/employees', icon: <People /> },
  { label: 'Attendance', path: '/admin/attendance', icon: <Assignment /> },
  { label: 'QR Code', path: '/admin/qr', icon: <QrCode /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box className="w-64 h-full bg-card border-r border-border flex flex-col p-4">
      <Box className="p-4 mb-8">
        <Typography variant="h5" className="text-primary font-bold">Anvil</Typography>
        <Typography variant="caption" className="text-text-secondary">Attendance System</Typography>
      </Box>

      <List className="flex-grow space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem 
              key={item.path} 
              disablePadding
              component={Link}
              href={item.path}
              className="relative rounded-lg overflow-hidden"
            >
              <Box className="w-full flex items-center p-3 z-10">
                <ListItemIcon className={isActive ? 'text-primary' : 'text-text-secondary'}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  className={isActive ? 'text-primary font-semibold' : 'text-text-secondary'}
                />
              </Box>
              
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-violet-50 border-r-4 border-primary"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider className="my-4" />

      <Button 
        fullWidth 
        startIcon={<Logout />} 
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="text-text-secondary hover:text-red-600 hover:bg-red-50 justify-start px-4 py-3"
      >
        Logout
      </Button>
    </Box>
  );
}
