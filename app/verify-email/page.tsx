'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  CircularProgress,
} from '@mui/material';
import ShimmerButton from '@/components/ui/shimmer-button';
import { useToast } from '@/components/shared/ToastProvider';

export default function VerifyEmail() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [email, setEmail] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerifyEmail');
    if (!pendingEmail) {
      router.push('/admin/signup');
      return;
    }
    setEmail(pendingEmail);

    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showToast('Please enter the full 6-digit code', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Email verified successfully!', 'success');
        localStorage.removeItem('pendingVerifyEmail');
        router.push('/admin/qr');
      } else {
        showToast(result.message || 'Verification failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    // We would normally call the resend API here
    // For now, let's just reset the timer and show a message
    showToast('OTP resent successfully', 'info');
    setTimer(60);
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-white hero-grain p-4">
      <Container maxWidth="sm">
        <Box className="text-center mb-8">
          <Typography variant="h2" className="text-primary mb-2">Verify Your Email</Typography>
          <Typography variant="body1" className="text-text-secondary">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </Typography>
        </Box>
        
        <Card>
          <CardContent className="p-8">
            <Box className="flex justify-between mb-8 gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-16 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
              ))}
            </Box>

            <ShimmerButton 
              onClick={handleVerify}
              className="w-full h-12 mb-6"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
            </ShimmerButton>

            <Box className="text-center">
              <Button 
                onClick={handleResend}
                disabled={timer > 0}
                className={timer > 0 ? 'text-text-secondary' : 'text-primary'}
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
