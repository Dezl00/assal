"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import { jsPDF } from "jspdf";
import { Download, QrCode, FileText, Image as ImageIcon, Link as LinkIcon, Palette, Wifi, Contact, Mail, ImagePlus, MonitorSmartphone, MessageCircle, MessageSquare, MapPin, Bitcoin, LayoutTemplate, BoxSelect, Moon, Sun, Circle, Square, Squircle } from "lucide-react";
import { toast } from "sonner";

type QRType = "url" | "wifi" | "vcard" | "email" | "whatsapp" | "sms" | "geo" | "crypto";
type TabType = "content" | "design";

export default function CompactQRCodeGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [qrType, setQrType] = useState<QRType>("url");
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const updateTimer = useRef<NodeJS.Timeout | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data States
  const [url, setUrl] = useState("https://example.com");
  const [ssid, setSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [waPhone, setWaPhone] = useState("");
  const [waText, setWaText] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsText, setSmsText] = useState("");
  const [geoLat, setGeoLat] = useState("");
  const [geoLng, setGeoLng] = useState("");
  const [cryptoType, setCryptoType] = useState("bitcoin");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");

  // Color & Shapes
  const [dotsColor, setDotsColor] = useState("#4f46e5");
  const [dotsType, setDotsType] = useState<DotType>("dots");
  const [cornersSquareType, setCornersSquareType] = useState<CornerSquareType>("dot");
  const [cornersDotType, setCornersDotType] = useState<CornerDotType>("dot");
  const [qrDensity, setQrDensity] = useState<number>(0);
  
  // Logo
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(0.4);
  const [logoMargin, setLogoMargin] = useState<number>(5);

  useEffect(() => {
    setIsDarkMode(false);
    document.documentElement.classList.remove('dark');
    
    if (typeof window !== 'undefined') {
      qrCodeInstance.current = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "svg", // Render as SVG so it's sharp at any scale
        imageOptions: { crossOrigin: "anonymous", margin: 10 },
      });
      // Append only once on mount!
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
        qrCodeInstance.current.append(qrRef.current);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    if (typeof document !== 'undefined') {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    updateQRCode();
  }, [qrType, url, ssid, wifiPassword, wifiEncryption, vcardName, vcardPhone, vcardEmail, emailTo, emailSubject, emailBody, waPhone, waText, smsPhone, smsText, geoLat, geoLng, cryptoType, cryptoAddress, cryptoAmount, dotsColor, dotsType, cornersSquareType, cornersDotType, logoFile, logoSize, logoMargin, qrDensity]);

  const generateDataString = () => {
    switch (qrType) {
      case "url": return url || "https://example.com";
      case "wifi": return `WIFI:T:${wifiEncryption};S:${ssid};P:${wifiPassword};;`;
      case "vcard": return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case "email": return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "whatsapp": return `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;
      case "sms": return `smsto:${smsPhone}:${smsText}`;
      case "geo": return `geo:${geoLat},${geoLng}`;
      case "crypto": return `${cryptoType}:${cryptoAddress}${cryptoAmount ? `?amount=${cryptoAmount}` : ''}`;
      default: return "https://example.com";
    }
  };

  const updateQRCode = () => {
    if (!qrCodeInstance.current) return;
    
    if (updateTimer.current) clearTimeout(updateTimer.current);
    
    updateTimer.current = setTimeout(() => {
      try {
        qrCodeInstance.current?.update({
          width: 300,
          height: 300,
          data: generateDataString(),
          margin: 5,
          qrOptions: { 
            errorCorrectionLevel: "H",
            typeNumber: qrDensity as any
          },
          image: logoFile || undefined,
          dotsOptions: { type: dotsType, color: dotsColor },
          backgroundOptions: { color: "#ffffff" },
          cornersSquareOptions: { type: cornersSquareType, color: dotsColor },
          cornersDotOptions: { type: cornersDotType, color: dotsColor },
          imageOptions: { crossOrigin: "anonymous", margin: logoMargin, imageSize: logoSize }
        });
      } catch (error) {
        if (qrDensity !== 0) {
          toast.error("هذه الكثافة لا تستوعب كمية البيانات. تم الرجوع للوضع التلقائي.");
          setQrDensity(0);
        } else {
          toast.error("حدث خطأ أثناء رسم الرمز، يرجى تقليل كمية البيانات!");
        }
      }
    }, 40); // 40ms debounce ensures UI doesn't freeze during color drag
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoFile(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Create a lightweight canvas-based instance just for export (tiny file sizes)
  const createExportInstance = () => {
    return new QRCodeStyling({
      width: 200,
      height: 200,
      type: "canvas", // Canvas produces tiny PNGs (3-5 KB)
      data: generateDataString(),
      margin: 5,
      qrOptions: { 
        errorCorrectionLevel: "H",
        typeNumber: qrDensity as any
      },
      image: logoFile || undefined,
      dotsOptions: { type: dotsType, color: dotsColor },
      backgroundOptions: { color: "#ffffff" },
      cornersSquareOptions: { type: cornersSquareType, color: dotsColor },
      cornersDotOptions: { type: cornersDotType, color: dotsColor },
      imageOptions: { crossOrigin: "anonymous", margin: logoMargin, imageSize: logoSize }
    });
  };

  const handleDownload = async (extension: "png" | "jpeg" | "svg") => {
    if (extension === "svg") {
      // For SVG, use the preview instance directly (vector = no size issue)
      qrCodeInstance.current?.download({ extension, name: "QRMaker" });
      return;
    }
    // For PNG/JPEG, create a fresh lightweight canvas instance
    try {
      const exportQR = createExportInstance();
      exportQR.download({ extension, name: "QRMaker" });
    } catch (err) {
      toast.error("حدث خطأ أثناء التحميل!");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const exportQR = createExportInstance();
      const buffer = await exportQR.getRawData("png");
      if (!buffer) return;
      const blob = new Blob([buffer], { type: "image/png" });
      const dataUrl = URL.createObjectURL(blob);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [100, 100] });
      pdf.addImage(dataUrl, "PNG", 10, 10, 80, 80);
      pdf.save("QRMaker.pdf");
      URL.revokeObjectURL(dataUrl);
    } catch(err) {
      toast.error("حدث خطأ أثناء التحميل!");
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950' : 'bg-white'} flex flex-col font-sans transition-colors duration-300`}>
      <header className="w-full py-4 px-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">QRMaker</h1>
          </div>
          <button onClick={toggleDarkMode} className="p-2 rounded-md bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors border border-gray-200 dark:border-zinc-700">
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </header>

      {/* Main container structured to center items vertically and horizontally */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl w-full mx-auto p-4 lg:p-6">
        
        <div className="grid lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* Left Column: Settings Panel */}
          <div className="lg:col-span-7 flex flex-col gap-3 w-full">
            
            {/* Tabs */}
            <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 flex gap-1.5 transition-colors duration-300">
              <button onClick={() => setActiveTab("content")} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "content" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800"}`}>
                <MonitorSmartphone className="w-4 h-4" /> المحتوى
              </button>
              <button onClick={() => setActiveTab("design")} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "design" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800"}`}>
                <Palette className="w-4 h-4" /> التصميم والأشكال
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 min-h-[400px] transition-colors duration-300">
              
              <style jsx>{`
                .flat-input {
                  width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; 
                  background-color: #ffffff; border: 1px solid #e5e7eb; color: #111827;
                  transition: all 0.2s; outline: none; font-size: 0.875rem;
                }
                .flat-input:focus { border-color: #4f46e5; }
                :global(.dark) .flat-input { background-color: #18181b; border-color: #27272a; color: #f4f4f5; }
                :global(.dark) .flat-input:focus { border-color: #6366f1; }
              `}</style>

              {/* CONTENT TAB */}
              {activeTab === "content" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {[
                      { id: "url", icon: LinkIcon, label: "رابط" },
                      { id: "whatsapp", icon: MessageCircle, label: "واتساب" },
                      { id: "sms", icon: MessageSquare, label: "SMS" },
                      { id: "wifi", icon: Wifi, label: "واي فاي" },
                      { id: "vcard", icon: Contact, label: "جهة اتصال" },
                      { id: "email", icon: Mail, label: "بريد" },
                      { id: "geo", icon: MapPin, label: "موقع" },
                      { id: "crypto", icon: Bitcoin, label: "كريبتو" }
                    ].map((type) => (
                      <button 
                        key={type.id} 
                        onClick={() => setQrType(type.id as QRType)} 
                        className={`flex-1 min-w-[70px] py-2 flex flex-col items-center gap-1 rounded-md text-[10px] font-bold transition-colors border ${qrType === type.id ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300" : "bg-transparent text-gray-500 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                      >
                        <type.icon className="w-4 h-4" /> {type.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    {qrType === "url" && (
                      <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">الرابط أو النص</label><textarea value={url} onChange={(e) => setUrl(e.target.value)} className="flat-input min-h-[80px]" /></div>
                    )}
                    {qrType === "whatsapp" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">رقم الهاتف</label><input type="text" value={waPhone} onChange={(e) => setWaPhone(e.target.value)} placeholder="+966xxxxxxxxx" className="flat-input" /></div>
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">الرسالة</label><textarea value={waText} onChange={(e) => setWaText(e.target.value)} className="flat-input h-[38px]" /></div>
                      </div>
                    )}
                    {qrType === "sms" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">رقم الهاتف</label><input type="text" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} className="flat-input" /></div>
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">النص</label><textarea value={smsText} onChange={(e) => setSmsText(e.target.value)} className="flat-input h-[38px]" /></div>
                      </div>
                    )}
                    {qrType === "geo" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">خط العرض (Lat)</label><input type="text" value={geoLat} onChange={(e) => setGeoLat(e.target.value)} className="flat-input" /></div>
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">خط الطول (Lng)</label><input type="text" value={geoLng} onChange={(e) => setGeoLng(e.target.value)} className="flat-input" /></div>
                      </div>
                    )}
                    {qrType === "crypto" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">العملة</label><select value={cryptoType} onChange={(e) => setCryptoType(e.target.value)} className="flat-input"><option value="bitcoin">Bitcoin</option><option value="ethereum">Ethereum</option></select></div>
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">العنوان</label><input type="text" value={cryptoAddress} onChange={(e) => setCryptoAddress(e.target.value)} className="flat-input" /></div>
                        <div><label className="block text-xs font-bold mb-1.5 text-gray-800 dark:text-gray-200">المبلغ</label><input type="text" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} className="flat-input" /></div>
                      </div>
                    )}
                    {qrType === "wifi" && (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input value={ssid} onChange={e=>setSsid(e.target.value)} placeholder="SSID" className="flat-input"/><input value={wifiPassword} onChange={e=>setWifiPassword(e.target.value)} placeholder="Password" type="password" className="flat-input"/></div>)}
                    {qrType === "vcard" && (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input value={vcardName} onChange={e=>setVcardName(e.target.value)} placeholder="Name" className="flat-input"/><input value={vcardPhone} onChange={e=>setVcardPhone(e.target.value)} placeholder="Phone" className="flat-input"/></div>)}
                    {qrType === "email" && (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input value={emailTo} onChange={e=>setEmailTo(e.target.value)} placeholder="To" className="flat-input"/><input value={emailBody} onChange={e=>setEmailBody(e.target.value)} placeholder="Body" className="flat-input"/></div>)}
                  </div>
                </div>
              )}

              {/* DESIGN TAB */}
              {activeTab === "design" && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  
                  {/* Single Color Row */}
                  <div className="bg-white dark:bg-zinc-800/30 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200">لون الرمز</label>
                    <input type="color" value={dotsColor} onChange={(e) => setDotsColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                  </div>

                  <hr className="border-gray-100 dark:border-zinc-800" />

                  {/* Shapes Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-gray-500">النقاط (Dots)</label>
                      <div className="flex gap-2">
                        {[{ id: "dots", icon: Circle }, { id: "square", icon: Square }, { id: "rounded", icon: Squircle }].map(shape => (
                          <button key={shape.id} onClick={() => setDotsType(shape.id as DotType)} className={`flex-1 flex justify-center py-2 rounded-md border transition-colors ${dotsType === shape.id ? "bg-gray-100 border-gray-400 text-black dark:bg-zinc-700 dark:border-zinc-500 dark:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}>
                            <shape.icon className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-gray-500">الإطار (Frame)</label>
                      <div className="flex gap-2">
                        {[{ id: "dot", icon: Circle }, { id: "square", icon: Square }, { id: "extra-rounded", icon: Squircle }].map(shape => (
                          <button key={shape.id} onClick={() => setCornersSquareType(shape.id as CornerSquareType)} className={`flex-1 flex justify-center py-2 rounded-md border transition-colors ${cornersSquareType === shape.id ? "bg-gray-100 border-gray-400 text-black dark:bg-zinc-700 dark:border-zinc-500 dark:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}>
                            <shape.icon className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-gray-500">المركز (Center)</label>
                      <div className="flex gap-2">
                        {[{ id: "dot", icon: Circle }, { id: "square", icon: Square }].map(shape => (
                          <button key={shape.id} onClick={() => setCornersDotType(shape.id as CornerDotType)} className={`flex-1 flex justify-center py-2 rounded-md border transition-colors ${cornersDotType === shape.id ? "bg-gray-100 border-gray-400 text-black dark:bg-zinc-700 dark:border-zinc-500 dark:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}>
                            <shape.icon className="w-5 h-5 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Density */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <button onClick={() => setQrDensity(0)} className={`flex-1 flex justify-center items-center h-10 rounded-md border transition-colors ${qrDensity === 0 ? "bg-gray-100 border-gray-400 text-black dark:bg-zinc-700 dark:border-zinc-500 dark:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}>
                        <div className="grid grid-cols-2 gap-0.5 opacity-80">
                          <div className="w-2 h-2 bg-current rounded-sm"></div><div className="w-2 h-2 bg-current rounded-sm"></div>
                          <div className="w-2 h-2 bg-current rounded-sm"></div><div className="w-2 h-2 bg-current rounded-sm"></div>
                        </div>
                      </button>
                      <button onClick={() => setQrDensity(15)} className={`flex-1 flex justify-center items-center h-10 rounded-md border transition-colors ${qrDensity === 15 ? "bg-gray-100 border-gray-400 text-black dark:bg-zinc-700 dark:border-zinc-500 dark:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}>
                        <div className="grid grid-cols-3 gap-[1px] opacity-80">
                          {[...Array(9)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-current rounded-sm"></div>)}
                        </div>
                      </button>
                      <button onClick={() => setQrDensity(30)} className={`flex-1 flex justify-center items-center h-10 rounded-md border transition-colors ${qrDensity === 30 ? "bg-gray-100 border-gray-400 text-black dark:bg-zinc-700 dark:border-zinc-500 dark:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}>
                        <div className="grid grid-cols-4 gap-[1px] opacity-80">
                          {[...Array(16)].map((_, i) => <div key={i} className="w-[3px] h-[3px] bg-current rounded-[1px]"></div>)}
                        </div>
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-zinc-800" />

                  {/* Logo Section */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-gray-800 dark:text-gray-200">الشعار (Logo)</label>
                      {logoFile && <button onClick={() => setLogoFile(null)} className="text-[10px] font-bold text-red-500 hover:underline">إزالة</button>}
                    </div>
                    
                    {!logoFile ? (
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-xs text-gray-700 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-zinc-800 dark:file:text-gray-200 cursor-pointer border border-dashed border-gray-300 dark:border-zinc-700 rounded-md p-1.5" />
                    ) : (
                      <div className="grid grid-cols-2 gap-4 p-3 bg-white dark:bg-zinc-800/30 rounded-lg border border-gray-200 dark:border-zinc-700">
                        <div>
                          <div className="flex justify-between mb-1 text-[10px] font-bold text-gray-600 dark:text-gray-400"><label>حجم الشعار</label><span>{Math.round(logoSize * 100)}%</span></div>
                          <input type="range" min="0.1" max="0.6" step="0.05" value={logoSize} onChange={(e) => setLogoSize(parseFloat(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none accent-black dark:accent-white" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-[10px] font-bold text-gray-600 dark:text-gray-400"><label>تفريغ حول الشعار</label><span>{logoMargin}px</span></div>
                          <input type="range" min="0" max="30" step="1" value={logoMargin} onChange={(e) => setLogoMargin(parseInt(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none accent-black dark:accent-white" />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preview & Export */}
          <div className="lg:col-span-5 flex flex-col items-center p-4 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 min-h-[400px] transition-colors duration-300">
            <h2 className="text-sm font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-1.5 w-full justify-center">
              <BoxSelect className="w-4 h-4 text-gray-400" /> المعاينة
            </h2>

            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl mb-6 w-full flex justify-center items-center overflow-hidden border border-gray-200 dark:border-zinc-800 transition-colors duration-300 min-h-[350px]">
              <div ref={qrRef} className="flex items-center justify-center bg-transparent w-full max-w-[300px]" />
            </div>

            <div className="w-full mt-auto">
              <div className="flex gap-2">
                <button onClick={() => handleDownload("png")} className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-colors border border-transparent">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs font-bold">PNG</span>
                </button>
                <button onClick={() => handleDownload("svg")} className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-colors border border-transparent">
                  <ImagePlus className="w-4 h-4" />
                  <span className="text-xs font-bold">SVG</span>
                </button>
                <button onClick={handleDownloadPDF} className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-colors border border-transparent">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold">PDF</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
