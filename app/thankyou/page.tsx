'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Paper } from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

export default function ThankYouPage() {
  useEffect(() => {
    // Only show confetti for successful check-in/check-out, not for already complete
    const attendanceType = localStorage.getItem('lastCheckinType') || 'check-in';
    if (attendanceType === 'complete') {
      return; // Skip confetti if attendance already complete
    }

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
  const [checkOutTime, setCheckOutTime] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [type, setType] = React.useState('check-in');
  const [detail, setDetail] = React.useState('');

  useEffect(() => {
    setName(localStorage.getItem('lastCheckinName') || 'there');
    const t = localStorage.getItem('lastCheckinTime');
    if (t) {
      setTime(t);
    } else {
      setTime(format(new Date(), 'hh:mm aa'));
    }
    const checkOut = localStorage.getItem('lastCheckoutTime');
    if (checkOut) {
      setCheckOutTime(checkOut);
    }
    setCompany(localStorage.getItem('lastCheckinCompany') || 'the company');
    setType(localStorage.getItem('lastCheckinType') || 'check-in');
    setDetail(localStorage.getItem('lastCheckinDetail') || '');
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
            {type === 'complete' ? (
              <Warning className="text-yellow-500 text-8xl" />
            ) : (
              <CheckCircle className="text-green-500 text-8xl" />
            )}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Typography variant="h3" className="font-bold mb-4 text-text-primary">
              {type === 'complete' 
                ? 'Attendance Already Complete! ✓'
                : type === 'check-in' 
                  ? 'Check-In Successful! ✓' 
                  : 'Check-Out Successful! ✓'
              }
            </Typography>
            
            {type === 'complete' ? (
              <>
                <Typography variant="h5" className="text-text-secondary mb-4">
                  Hello <strong>{name}</strong>,
                </Typography>
                <Typography variant="body1" className="text-text-secondary mb-6">
                  {detail}
                </Typography>
                <Paper className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
                  <Typography variant="body2" className="text-yellow-800 text-center font-semibold">
                    ⚠️ Daily Limit Reached
                  </Typography>
                  <Typography variant="caption" className="text-yellow-700 text-center block mt-2">
                    You can only check in once and check out once per day.
                    <br />
                    Your attendance for today is complete at <strong>{company}</strong>
                  </Typography>
                </Paper>
                <Typography variant="body2" className="text-text-secondary opacity-60">
                  See you tomorrow!
                </Typography>
              </>
            ) : type === 'check-out' && checkOutTime ? (
              <>
                <Typography variant="h5" className="text-text-secondary mb-4">
                  Thank you, <strong>{name}</strong>!
                </Typography>
                <Typography variant="body1" className="text-text-secondary mb-8">
                  Check-In: <strong>{time}</strong>
                  <br />
                  Check-Out: <strong>{checkOutTime}</strong>
                  <br />
                  <strong>{company}</strong>
                </Typography>
                <Typography variant="body2" className="text-text-secondary opacity-60">
                  Your attendance for today is now complete. See you tomorrow!
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h5" className="text-text-secondary mb-8">
                  Thank you, <strong>{name}</strong>.
                  <br />
                  Your {type === 'check-in' ? 'check-in' : 'check-out'} at <strong>{time || checkOutTime}</strong> for <strong>{company}</strong> has been recorded.
                </Typography>
                <Typography variant="body2" className="text-text-secondary opacity-60">
                  {type === 'check-in' ? 'Have a productive day! Remember to check out when you leave.' : 'See you tomorrow!'}
                </Typography>
              </>
            )}
          </motion.div>
        </Card>
      </Container>
    </Box>
  );
}
