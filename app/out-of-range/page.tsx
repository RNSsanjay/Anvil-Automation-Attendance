'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { NearMe, Directions } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function OutOfRange() {
  const [distance, setDistance] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    setDistance(localStorage.getItem('lastDistance'));
    setCompanyName(localStorage.getItem('lastCompanyName'));
    const loc = localStorage.getItem('lastCompanyLocation');
    if (loc) setLocation(JSON.parse(loc));
  }, []);

  const handleGetDirections = () => {
    if (location) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-white p-4">
      <Container maxWidth="sm">
        <Card className="text-center p-8">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 inline-block"
          >
            <Box className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <NearMe className="text-red-500 text-4xl" />
            </Box>
          </motion.div>

          <Typography variant="h4" className="font-bold mb-4 text-text-primary">
            You&apos;re Out of Range
          </Typography>
          
          <Typography variant="body1" className="text-text-secondary mb-2">
            You&apos;re too far from <strong>{companyName || 'the company'}</strong>&apos;s location to mark attendance.
          </Typography>
          
          <Typography variant="h6" className="text-primary font-bold mb-8">
            You are approximately {distance || 'X'} meters away. 
            <br />
            <span className="text-sm font-normal text-text-secondary">Please be within 100m.</span>
          </Typography>

          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={handleGetDirections}
            startIcon={<Directions />}
            className="h-12"
          >
            Get Directions
          </Button>
          
          <Button 
            variant="text" 
            fullWidth 
            className="mt-4 text-text-secondary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </Container>
    </Box>
  );
}

// Helper to include Container which was missing in imports
import { Container } from '@mui/material';
