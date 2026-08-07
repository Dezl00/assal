"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCodeStyling, { DrawType, TypeNumber, Mode, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import { jsPDF } from "jspdf";
import { Download, QrCode, FileText, Image as ImageIcon, Link as LinkIcon, Palette, Wifi, Contact, Mail, ImagePlus, Check, MonitorSmartphone } from "lucide-react";

type QRType = "url" | "wifi" | "vcard" | "email";

export default function AdvancedQRCodeGenerator() {
  const [qrType, setQrType] = useState<QRType>("url");
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  // Data States
  const [url, setUrl] = useState("https://example.com");
  
  // WiFi
  const [ssid, setSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardCompany, setVcardCompany] = useState("");

  // Email
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Styling States
  const [dotsColor, setDotsColor] = useState("#4f46e5");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dotsType, setDotsType] = useState<DotType>("rounded");
  const [cornersSquareType, setCornersSquareType] = useState<CornerSquareType>("extra-rounded");
  const [cornersDotType, setCornersDotType] = useState<CornerDotType>("dot");
  
  // Logo
  const [logoFile, setLogoFile] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      qrCodeInstance.current = new QRCodeStyling({
        width: 300,
        height: 300,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
        },
      });
    }
  }, []);

  useEffect(() => {
    updateQRCode();
  }, [qrType, url, ssid, wifiPassword, wifiEncryption, wifiHidden, vcardName, vcardPhone, vcardEmail, vcardCompany, emailTo, emailSubject, emailBody, dotsColor, bgColor, dotsType, cornersSquareType, cornersDotType, logoFile]);

  const generateDataString = () => {
    switch (qrType) {
      case "url":
        return url || "https://example.com";
      case "wifi":
        return `WIFI:T:${wifiEncryption};S:${ssid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardCompany}\nEND:VCARD`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      default:
        return "https://example.com";
    }
  };

  const updateQRCode = () => {
    if (!qrCodeInstance.current) return;
    
    const data = generateDataString();
    
    qrCodeInstance.current.update({
      data,
      image: logoFile || undefined,
      dotsOptions: {
        color: dotsColor,
        type: dotsType
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: dotsColor,
      },
      cornersDotOptions: {
        type: cornersDotType,
        color: dotsColor,
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCodeInstance.current.append(qrRef.current);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoFile(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (extension: "png" | "jpeg" | "svg") => {
    if (!qrCodeInstance.current) return;
    qrCodeInstance.current.download({
      extension: extension,
      name: "QRMaker"
    });
  };

  const handleDownloadPDF = async () => {
    if (!qrCodeInstance.current) return;
    try {
      const buffer = await qrCodeInstance.current.getRawData("png");
      if (!buffer) return;
      
      const blob = new Blob([buffer], { type: "image/png" });
      const dataUrl = URL.createObjectURL(blob);
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 100]
      });
      
      pdf.addImage(dataUrl, "PNG", 10, 10, 80, 80);
      pdf.save("QRMaker.pdf");
      URL.revokeObjectURL(dataUrl);
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col font-sans">
      <header className="w-full py-6 px-4 md:px-8 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <QrCode className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QRMaker Pro</h1>
            <p className="text-xs text-gray-500 font-medium">أداة احترافية لإنشاء الرموز</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-8 items-start mt-4">
        
        {/* Left Column: Data Input */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100 border-b pb-3 border-gray-100 dark:border-zinc-800">
              <MonitorSmartphone className="w-5 h-5 text-indigo-500" />
              المحتوى (Content Type)
            </h2>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button onClick={() => setQrType("url")} className={`py-2 px-3 flex flex-col items-center gap-1 rounded-xl text-sm font-medium transition-all ${qrType === "url" ? "bg-indigo-50 text-indigo-700 border-indigo-200 border" : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"}`}>
                <LinkIcon className="w-4 h-4" /> رابط
              </button>
              <button onClick={() => setQrType("wifi")} className={`py-2 px-3 flex flex-col items-center gap-1 rounded-xl text-sm font-medium transition-all ${qrType === "wifi" ? "bg-indigo-50 text-indigo-700 border-indigo-200 border" : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"}`}>
                <Wifi className="w-4 h-4" /> واي فاي
              </button>
              <button onClick={() => setQrType("vcard")} className={`py-2 px-3 flex flex-col items-center gap-1 rounded-xl text-sm font-medium transition-all ${qrType === "vcard" ? "bg-indigo-50 text-indigo-700 border-indigo-200 border" : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"}`}>
                <Contact className="w-4 h-4" /> جهة اتصال
              </button>
              <button onClick={() => setQrType("email")} className={`py-2 px-3 flex flex-col items-center gap-1 rounded-xl text-sm font-medium transition-all ${qrType === "email" ? "bg-indigo-50 text-indigo-700 border-indigo-200 border" : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"}`}>
                <Mail className="w-4 h-4" /> بريد
              </button>
            </div>

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {qrType === "url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرابط أو النص</label>
                  <textarea value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px]" />
                </div>
              )}

              {qrType === "wifi" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشبكة (SSID)</label>
                    <input type="text" value={ssid} onChange={(e) => setSsid(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                    <input type="password" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التشفير</label>
                    <select value={wifiEncryption} onChange={(e) => setWifiEncryption(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">بدون تشفير</option>
                    </select>
                  </div>
                </>
              )}

              {qrType === "vcard" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input type="text" value={vcardName} onChange={(e) => setVcardName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                    <input type="tel" value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input type="email" value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الشركة</label>
                    <input type="text" value={vcardCompany} onChange={(e) => setVcardCompany(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                </>
              )}

              {qrType === "email" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">إلى (البريد الإلكتروني)</label>
                    <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع</label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                    <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px]" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Styling Options */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-zinc-800 space-y-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 border-b pb-3 border-gray-100">
            <Palette className="w-5 h-5 text-purple-500" />
            التصميم (Design)
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الألوان (Colors)</label>
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-50 p-2 rounded-xl flex items-center justify-between border border-gray-100">
                  <span className="text-xs text-gray-600 font-medium">النقاط</span>
                  <input type="color" value={dotsColor} onChange={(e) => setDotsColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                </div>
                <div className="flex-1 bg-gray-50 p-2 rounded-xl flex items-center justify-between border border-gray-100">
                  <span className="text-xs text-gray-600 font-medium">الخلفية</span>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شكل النقاط (Dots)</label>
              <select value={dotsType} onChange={(e) => setDotsType(e.target.value as DotType)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-gray-50">
                <option value="square">مربعات (Square)</option>
                <option value="dots">دوائر (Dots)</option>
                <option value="rounded">حواف دائرية (Rounded)</option>
                <option value="classy">أنيق (Classy)</option>
                <option value="classy-rounded">أنيق دائري (Classy Rounded)</option>
                <option value="extra-rounded">دائري جداً (Extra Rounded)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شكل الزوايا (Corners)</label>
              <div className="grid grid-cols-2 gap-3">
                <select value={cornersSquareType} onChange={(e) => setCornersSquareType(e.target.value as CornerSquareType)} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-xs bg-gray-50">
                  <option value="square">مربع (الإطار)</option>
                  <option value="dot">دائري (الإطار)</option>
                  <option value="extra-rounded">شبه دائري</option>
                </select>
                <select value={cornersDotType} onChange={(e) => setCornersDotType(e.target.value as CornerDotType)} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-xs bg-gray-50">
                  <option value="square">مربع (المركز)</option>
                  <option value="dot">دائري (المركز)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الشعار (Logo)</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                <label htmlFor="logo-upload" className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors cursor-pointer bg-gray-50 hover:bg-purple-50">
                  <ImagePlus className="w-5 h-5" />
                  {logoFile ? "تغيير الشعار" : "رفع شعار"}
                </label>
                {logoFile && (
                  <button onClick={() => setLogoFile(null)} className="mt-2 text-xs text-red-500 font-medium hover:underline w-full text-center">
                    إزالة الشعار
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Export */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl border border-indigo-100 dark:border-zinc-800 min-h-[500px]">
          
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-indigo-200/50 dark:shadow-none mb-8 transition-all duration-300 hover:scale-105">
            <div ref={qrRef} className="w-[300px] h-[300px] flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden">
              {/* QR Rendered Here */}
            </div>
          </div>

          <div className="w-full space-y-3 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
            <h3 className="text-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center justify-center gap-2">
              <Download className="w-4 h-4 text-indigo-500" />
              تصدير (Export)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleDownload("png")} className="flex flex-col items-center gap-1 py-2 px-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                <span className="text-sm font-bold">PNG</span>
              </button>
              <button onClick={() => handleDownload("svg")} className="flex flex-col items-center gap-1 py-2 px-2 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-all shadow-sm">
                <span className="text-sm font-bold">SVG</span>
              </button>
              <button onClick={handleDownloadPDF} className="flex flex-col items-center gap-1 py-2 px-2 bg-white border border-gray-200 rounded-lg hover:border-pink-500 hover:text-pink-600 transition-all shadow-sm">
                <span className="text-sm font-bold">PDF</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
