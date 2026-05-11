'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

export default function ThankYouPage() {
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#7C3AED', '#A78BFA', '#FFFFFF'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#7C3AED', '#A78BFA', '#FFFFFF'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const [name, setName] = React.useState('');
  const [time, setTime] = React.useState('');
  const [company, setCompany] = React.useState('');

  useEffect(() => {
    setName(localStorage.getItem('lastCheckinName') || 'there');
    const t = localStorage.getItem('lastCheckinTime');
    if (t) {
      setTime(t);
    } else {
      setTime(format(new Date(), 'hh:mm aa'));
    }
    setCompany(localStorage.getItem('lastCheckinCompany') || 'the company');
  }, []);

  return (
    <Box className="min-h-screen flex items-center justify-center bg-white hero-grain p-4">
      <Container maxWidth="sm">
        <Card className="text-center p-12 overflow-hidden relative">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="mb-8 inline-block"
          >
            <CheckCircle className="text-green-500 text-8xl" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Typography variant="h3" className="font-bold mb-4 text-text-primary">
              Attendance Marked! ✓
            </Typography>
            
            <Typography variant="h5" className="text-text-secondary mb-8">
              Thank you, <strong>{name}</strong>.
              <br />
              Your check-in at <strong>{time}</strong> for <strong>{company}</strong> has been recorded.
            </Typography>

            <Typography variant="body2" className="text-text-secondary opacity-60">
              You can now close this window.
            </Typography>
          </motion.div>
        </Card>
      </Container>
    </Box>
  );
}
