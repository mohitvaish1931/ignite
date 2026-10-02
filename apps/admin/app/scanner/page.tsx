"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, XCircle, User, Calendar, Loader2, ShieldCheck } from "lucide-react";
import { useNavigation } from "@project-organizer/ui";

export default function ScannerPage() {
  const { activeRole } = useNavigation();
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  // The scanner keeps the first onScanSuccess it was given, so a state flag would be stale
  const processingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scannerRef.current.render(onScanSuccess, onScanFailure);
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (processingRef.current) return; // Prevent multiple rapid scans
    processingRef.current = true;

    setIsScanning(true);
    setScanResult(null);
    setError(null);

    // Pause the scanner to process the result
    if (scannerRef.current) {
      scannerRef.current.pause(true);
    }

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: decodedText }),
      });
      const data = await res.json();

      if (data.success) {
        // Play a beep sound for success
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.play().catch(() => {}); // Ignore if autoplay is blocked
        setScanResult(data);
      } else {
        setError(data.message || "Failed to check in");
        if (data.data) {
          setScanResult({ errorData: data.data });
        }
      }
    } catch (err) {
      setError("Network error while scanning.");
    } finally {
      setIsScanning(false);
    }
  };

  const resumeScanner = () => {
    processingRef.current = false;
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const onScanFailure = (error: any) => {
    // html5-qrcode calls this frequently when no QR is found.
    // We just ignore it to avoid console spam.
  };

  const resumeScan = () => {
    setScanResult(null);
    setError(null);
    resumeScanner();
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">QR Scanner</h1>
          <p className="text-slate-400">Scan participant tickets for check-in</p>
        </div>
        
        {/* Volunteer Dashboard Info */}
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex justify-center items-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Dashboard Profile</p>
            <p className="font-bold text-foreground">Assigned Role: <span className="text-primary">{activeRole}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
          <p><strong>Note:</strong> Browsers block camera access on non-secure (HTTP) IP addresses (like <code className="bg-black/30 px-1 rounded">192.168.x.x</code>). To test on your phone, you must use a tunneling service (like ngrok) or enable <code className="bg-black/30 px-1 rounded">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code>. Otherwise, test on your laptop via <code className="bg-black/30 px-1 rounded">localhost</code>.</p>
        </div>

        {/* Scanner Container */}
        <div id="qr-reader" className="w-full min-h-[300px] rounded-lg overflow-hidden border-2 border-primary/20 bg-black/50" />

        {isScanning && (
          <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg text-primary">
            <Loader2 className="w-5 h-5 animate-spin" /> Processing scan...
          </div>
        )}

        {/* Success State */}
        {scanResult && !error && (
          <div className="flex flex-col items-center gap-4 p-6 bg-success/10 border border-success/30 rounded-xl text-center">
            <CheckCircle className="w-16 h-16 text-success" />
            <div>
              <h2 className="text-2xl font-bold text-success">Check-In Successful!</h2>
              <div className="mt-4 flex flex-col items-start text-left gap-2 p-4 bg-card rounded-lg border border-border w-full">
                <p className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-muted-foreground" /> {scanResult.data.user}</p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground ml-7">{scanResult.data.email}</p>
                <p className="flex items-center gap-2 text-sm mt-2"><Calendar className="w-5 h-5 text-muted-foreground" /> {scanResult.data.event}</p>
              </div>
            </div>
            <button 
              onClick={resumeScan}
              className="mt-4 px-6 py-2 bg-success text-success-foreground rounded-md font-semibold hover:bg-success/90 transition-colors"
            >
              Scan Next Participant
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center gap-4 p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
            <XCircle className="w-16 h-16 text-destructive" />
            <div>
              <h2 className="text-2xl font-bold text-destructive">Scan Failed</h2>
              <p className="text-destructive mt-1">{error}</p>
              
              {scanResult?.errorData && (
                 <div className="mt-4 flex flex-col items-start text-left gap-2 p-4 bg-card rounded-lg border border-border w-full">
                 <p className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-muted-foreground" /> {scanResult.errorData.user}</p>
                 <p className="flex items-center gap-2 text-sm mt-2"><Calendar className="w-5 h-5 text-muted-foreground" /> {scanResult.errorData.event}</p>
                 {scanResult.errorData.checkedInAt && (
                   <p className="text-sm text-muted-foreground ml-7">
                     Checked in at {new Date(scanResult.errorData.checkedInAt).toLocaleString()}
                   </p>
                 )}
               </div>
              )}
            </div>
            <button 
              onClick={resumeScan}
              className="mt-4 px-6 py-2 bg-destructive text-destructive-foreground rounded-md font-semibold hover:bg-destructive/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
