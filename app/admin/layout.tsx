'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  IconButton, 
  Drawer, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from '@/components/admin/Sidebar';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (status === 'loading') {
    return (
      <Box className="h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    router.push('/admin/login');
    return null;
  }

  return (
    <Box className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar for Desktop */}
      {!isMobile && <Sidebar />}

      {/* Sidebar for Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        <Sidebar onMobileNavigate={handleDrawerToggle} />
      </Drawer>

      <Box className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <Box className="flex items-center p-4 border-b bg-white z-10">
            <IconButton onClick={handleDrawerToggle} className="mr-2">
              <MenuIcon />
            </IconButton>
            <motion.div initial="initial" animate="animate">
              <Typography variant="h6" className="text-primary font-bold flex overflow-hidden">
                {"Presenz".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      initial: { y: 10, opacity: 0 },
                      animate: { y: 0, opacity: 1, transition: { delay: index * 0.05 } }
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </Typography>
            </motion.div>
          </Box>
        )}

        <Box className="flex-grow overflow-auto p-4 md:p-8 flex flex-col">
          <Box className="flex-grow">
            {children}
          </Box>
          <Box className="mt-8 pt-8 border-t border-violet-50 text-center">
            <Typography variant="caption" className="text-text-secondary font-medium">
              &copy; {new Date().getFullYear()} Presenz • Powered by <strong>RNS Solutions</strong>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
