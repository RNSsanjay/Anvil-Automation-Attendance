'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  delay?: number;
}

export default function StatCard({ label, value, icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className="relative overflow-hidden h-full group">
        <AnimatedGridPattern 
          numSquares={15} 
          maxOpacity={0.1} 
          duration={3} 
          className="text-violet-200"
        />
        <CardContent className="relative z-10 p-6 flex flex-col justify-between h-full">
          <Box className="flex justify-between items-start mb-4">
            <Typography variant="body2" className="text-text-secondary font-medium">
              {label}
            </Typography>
            <Box className="text-primary opacity-80 group-hover:scale-110 transition-transform">
              {icon}
            </Box>
          </Box>
          <Typography variant="h3" className="text-primary font-bold">
            {value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}
