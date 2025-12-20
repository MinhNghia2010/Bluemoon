import { useState } from 'react';
import { Building2, Check, X } from 'lucide-react';

interface ApartmentInfoFormProps {
  onSuccess: (message: string) => void;
}

export function ApartmentInfoForm({ onSuccess }: ApartmentInfoFormProps) {
  const [apartmentName, setApartmentName] = useState('BlueMoon Apartments');
  const [address, setAddress] = useState('123 Main Street, City, State 12345');
  const [phone, setPhone] = useState('0551234567');
  const [email, setEmail] = useState('admin@bluemoon.com');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = phone.replace(/[^0-9]/g, '').length >= 10 && phone.replace(/[^0-9]/g, '').length <= 11;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess('Profile updated successfully!');
  };

  return (
    <div className="bg-bg-white rounded-[16px] p-[32px] shadow-lg border border-border-light">
      <div className="flex items-center gap-[12px] mb-[24px]">
        <Building2 className="size-[24px] text-[#5030e5]" />
        <h3 className="font-semibold text-text-primary text-[20px]">Apartment Information</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-[20px]">
          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Apartment Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={apartmentName}
                onChange={(e) => setApartmentName(e.target.value)}
                className={`w-full h-[44px] px-[16px] pr-10 bg-input-bg rounded-[6px] border ${apartmentName.trim().length > 0 ? 'border-green-500' : 'border-transparent'} text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
              />
              {apartmentName.trim().length > 0 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full h-[44px] px-[16px] pr-10 bg-input-bg rounded-[6px] border ${address.trim().length > 0 ? 'border-green-500' : 'border-transparent'} text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
              />
              {address.trim().length > 0 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setPhone(value);
                }}
                className={`w-full h-[44px] px-[16px] pr-16 bg-input-bg rounded-[6px] border ${isPhoneValid ? 'border-green-500' : phone.length > 0 ? 'border-red-500' : 'border-transparent'} text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className={`text-xs ${isPhoneValid ? 'text-green-500' : 'text-text-muted'}`}>
                  {phone.length}/10-11
                </span>
                {isPhoneValid && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {phone.length > 0 && !isPhoneValid && (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-[44px] px-[16px] pr-10 bg-input-bg rounded-[6px] border ${isEmailValid ? 'border-green-500' : email.length > 0 ? 'border-red-500' : 'border-transparent'} text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
              />
              {isEmailValid && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {email.length > 0 && !isEmailValid && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
