'use client';

import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Box, Typography, Button, Stack, Card } from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import { BorderBeam } from '@/components/ui/border-beam';
import SparklesText from '@/components/ui/sparkles-text';
import { motion } from 'framer-motion';

interface QRDisplayProps {
  companyId: string;
  companyName: string;
}

export default function QRDisplay({ companyId, companyName }: QRDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const scanUrl = `${window.location.origin}/scan/${companyId}`;

  const handleDownload = (format: 'png' | 'svg' | 'pdf') => {
    // In a real app, we'd use a library like html-to-image or similar
    // For now, let's just log or show a message
    console.log(`Downloading QR in ${format} format for ${scanUrl}`);
    alert(`Downloading ${format.toUpperCase()}... (Implementation requires additional libraries like html2canvas)`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box className="flex flex-col items-center gap-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <SparklesText text={companyName} className="text-4xl font-bold text-primary mb-2" />
        <Typography variant="body1" className="text-text-secondary">
          Scan this QR code to mark your attendance
        </Typography>
      </motion.div>

      <Card className="relative p-8 bg-white overflow-hidden" sx={{ width: 300, height: 300 }}>
        <Box ref={qrRef} className="w-full h-full flex items-center justify-center">
          <QRCode
            value={scanUrl}
            size={240}
            level="H"
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            fgColor="#0F0A1E"
          />
        </Box>
        <BorderBeam size={300} duration={12} delay={0} />
      </Card>

      <Stack direction="row" spacing={2} className="mt-4 print:hidden">
        <Button 
          variant="outlined" 
          startIcon={<Download />}
          onClick={() => handleDownload('png')}
          className="border-violet-100 text-violet-600 hover:bg-violet-50"
        >
          Download PNG
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Print />}
          onClick={handlePrint}
          className="border-violet-100 text-violet-600 hover:bg-violet-50"
        >
          Print QR
        </Button>
      </Stack>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </Box>
  );
}
