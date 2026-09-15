import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { Download, Printer, ShieldCheck, Award, MapPin } from 'lucide-react';
import { Member, OrganizationSettings } from '../types';

interface DigitalIdCardProps {
  member: Member;
  settings?: OrganizationSettings | null;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ member, settings }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate QR code pointing to public verification endpoint
  useEffect(() => {
    const origin = window.location.origin;
    const verifyUrl = `${origin}/verify/${member.membership_id}`;

    QRCode.toDataURL(verifyUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [member.membership_id]);

  // Combine existing address fields cleanly into full permanent address
  const formatMemberAddress = (m: Member): string => {
    const rawAddr = (m.address || '').trim();
    const district = (m.district || '').trim();
    const state = (m.state || '').trim();

    const parts: string[] = [];
    if (rawAddr) {
      parts.push(rawAddr);
    }
    // Append district if not already mentioned in base address string
    if (district && !rawAddr.toLowerCase().includes(district.toLowerCase())) {
      parts.push(`Dist: ${district}`);
    }
    // Append state if not already mentioned in base address string
    if (state && !rawAddr.toLowerCase().includes(state.toLowerCase())) {
      parts.push(state);
    }

    return parts.length > 0 ? parts.join(', ') : '—';
  };

  const completeAddress = formatMemberAddress(member);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 3, // High-res 300dpi equivalent for sharp print & display
        skipFonts: true, // Prevents cross-origin cssRules access errors on Google Fonts
      });
      const link = document.createElement('a');
      link.download = `Paswan_Ekta_Manch_ID_${member.membership_id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ID card image:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const orgName = settings?.org_name || 'PASWAN EKTA MANCH';
  const orgNameHindi = settings?.org_name_hindi || 'पासवान एकता मंच';
  const logoUrl = settings?.logo_url || '/default-assets/logo.svg';
  const signatureUrl = settings?.signature_url || '/default-assets/signature.svg';
  const authPerson = settings?.authorized_person_name || 'Authorized Signatory';
  const authDesignation = settings?.authorized_person_designation || 'Rashtriya Sangathan Mahasachiv';

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-xl mx-auto">
      {/* Printable ID Card Container */}
      <div
        id="printable-id-card"
        ref={cardRef}
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-amber-500 relative select-none"
        style={{
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.2), 0 8px 10px -6px rgba(217, 119, 6, 0.2)',
        }}
      >
        {/* Decorative Top Golden Trim */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 w-full" />

        {/* Card Header */}
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white px-4 py-3 relative border-b-2 border-amber-400">
          <div className="flex items-center space-x-3">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-12 h-12 rounded-full border-2 border-amber-400 bg-white p-0.5 object-contain shrink-0"
              crossOrigin="anonymous"
            />
            <div className="flex-1 text-center pr-2">
              <h2 className="text-lg font-black tracking-tight font-serif text-white leading-tight">
                {orgNameHindi}
              </h2>
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-widest leading-none mt-0.5">
                {orgName}
              </p>
              <p className="text-[9px] text-blue-200 mt-0.5">
                राष्ट्रीय सामाजिक संगठन • समाज सेवा एवं एकता
              </p>
            </div>
          </div>
        </div>

        {/* Sub Header Badge: Digital Identity Card */}
        <div className="bg-amber-500 text-slate-950 font-bold text-[11px] py-1 px-4 flex justify-between items-center shadow-inner">
          <span className="tracking-wide">DIGITAL MEMBERSHIP ID CARD</span>
          <span className="bg-blue-950 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>APPROVED MEMBER</span>
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 bg-gradient-to-b from-slate-50 to-white relative">
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Award className="w-56 h-56 text-blue-950" />
          </div>

          <div className="grid grid-cols-3 gap-3.5 relative z-10 items-start">
            {/* Member Photo Box */}
            <div className="col-span-1 flex flex-col items-center">
              <div className="w-24 h-28 rounded-lg overflow-hidden border-2 border-amber-500 bg-slate-200 shadow-sm relative">
                <img
                  src={member.photo_url || '/default-assets/logo.svg'}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="mt-1.5 text-center">
                <span className="inline-block bg-blue-900 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/50 uppercase tracking-wide">
                  {member.role}
                </span>
              </div>
            </div>

            {/* Member Details */}
            <div className="col-span-2 space-y-1.5 text-left text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">सदस्य का नाम / Member Name</span>
                <span className="text-sm font-bold text-slate-900 block leading-tight">{member.name}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">पिता का नाम / Father's Name</span>
                <span className="font-semibold text-slate-800 block leading-tight">{member.father_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block uppercase">सदस्यता संख्या / ID</span>
                  <span className="font-mono font-bold text-blue-900 block text-xs">{member.membership_id}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block uppercase">मोबाइल / Mobile</span>
                  <span className="font-semibold text-slate-800 block text-xs">+91 {member.mobile}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block uppercase">जिला / District</span>
                  <span className="font-semibold text-slate-800 block text-xs">{member.district}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block uppercase">राज्य / State</span>
                  <span className="font-semibold text-slate-800 block text-xs">{member.state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: QR Code & Authorized Signatory */}
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 items-center">
            {/* QR Code */}
            <div className="col-span-1 flex flex-col items-center">
              {qrDataUrl ? (
                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                  <img
                    src={qrDataUrl}
                    alt="Verify QR"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center text-[8px] text-slate-400">
                  Generating QR...
                </div>
              )}
              <span className="text-[8px] text-blue-950 font-bold mt-0.5 tracking-tighter">
                SCAN TO VERIFY
              </span>
            </div>

            {/* Signature & Auth Person */}
            <div className="col-span-2 flex flex-col items-end text-right">
              <div className="h-9 flex items-end">
                <img
                  src={signatureUrl}
                  alt="Signature"
                  className="max-h-8 max-w-[120px] object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="w-32 border-b border-slate-400 my-0.5" />
              <p className="text-[10px] font-bold text-slate-900 leading-tight">
                {authPerson}
              </p>
              <p className="text-[8px] text-slate-600 leading-none">
                {authDesignation}
              </p>
              <p className="text-[8px] text-amber-700 font-bold mt-0.5">
                {orgNameHindi}
              </p>
            </div>
          </div>

          {/* Member Complete Address Footer */}
          <div className="mt-3 pt-2 border-t border-slate-200/90 text-left bg-slate-100/70 -mx-4 -mb-4 px-4 py-2 border-b border-amber-400/40">
            <div className="flex items-start space-x-1.5">
              <MapPin className="w-3 h-3 text-blue-900 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wide block leading-none">
                  स्थायी पता / Permanent Address
                </span>
                <p className="text-[9.5px] font-semibold text-slate-800 leading-snug break-words mt-0.5">
                  {completeAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="bg-blue-950 text-slate-300 text-[9px] py-1 px-4 text-center border-t border-amber-500">
          <span>Official Identity Card of {orgName} • Valid across India</span>
        </div>
      </div>

      {/* Action Buttons: Download & Print */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full no-print">
        <button
          onClick={handleDownloadImage}
          disabled={downloading}
          className="flex-1 min-w-[180px] max-w-[220px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>{downloading ? 'Preparing Card...' : 'Download ID Card'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex-1 min-w-[150px] max-w-[180px] px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition flex items-center justify-center space-x-2"
        >
          <Printer className="w-4 h-4 text-blue-900" />
          <span>Print ID Card</span>
        </button>
      </div>
    </div>
  );
};
