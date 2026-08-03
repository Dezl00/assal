"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Download, QrCode, FileText, Image as ImageIcon, Link as LinkIcon, Palette } from "lucide-react";

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrSvg, setQrSvg] = useState("");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  useEffect(() => {
    generateQRCode();
  }, [text, color, bgColor]);

  const generateQRCode = async () => {
    if (!text) {
      setQrDataUrl("");
      setQrSvg("");
      return;
    }

    try {
      const opts = {
        color: {
          dark: color,
          light: bgColor,
        },
        margin: 1,
        width: 300,
      };

      const dataUrl = await QRCode.toDataURL(text, opts);
      setQrDataUrl(dataUrl);

      const svgString = await QRCode.toString(text, { ...opts, type: "svg" });
      setQrSvg(svgString);
    } catch (err) {
      console.error("Error generating QR Code", err);
    }
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSVG = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!qrDataUrl) return;
    // Create PDF (A4 size default, we just put the image in it or make it square)
    // We'll make a small PDF size suitable for just the QR code
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 100] // 100x100 mm
    });
    
    // Add image to PDF (format, x, y, width, height)
    pdf.addImage(qrDataUrl, "PNG", 10, 10, 80, 80);
    pdf.save("qrcode.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col font-sans">
      <header className="w-full py-6 px-4 md:px-8 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <QrCode className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            QRMaker
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 grid md:grid-cols-2 gap-8 items-start mt-8">
        {/* Left Column: Controls */}
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <LinkIcon className="w-5 h-5 text-indigo-500" />
            المحتوى (Content)
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                الرابط أو النص (URL or Text)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none min-h-[120px]"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                الألوان (Colors)
              </h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">اللون الأمامي (Foreground)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{color}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">لون الخلفية (Background)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview and Export */}
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl border border-indigo-100 dark:border-zinc-800 min-h-[400px]">
          {text ? (
            <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center w-full">
              <div className="bg-white p-4 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
              </div>

              <div className="w-full space-y-3">
                <h3 className="text-center text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                  تصدير (Export As)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={handleDownloadPNG}
                    className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group shadow-sm hover:shadow-md"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-sm font-medium">PNG</span>
                  </button>
                  <button
                    onClick={handleDownloadSVG}
                    className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all group shadow-sm hover:shadow-md"
                  >
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-violet-500 transition-colors" />
                    <span className="text-sm font-medium">SVG</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all group shadow-sm hover:shadow-md"
                  >
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
                    <span className="text-sm font-medium">PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500 flex flex-col items-center">
              <QrCode className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">أدخل نصاً أو رابطاً لإنشاء رمز QR</p>
              <p className="text-sm mt-2">Enter text or URL to generate QR Code</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
