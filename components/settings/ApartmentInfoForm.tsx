import { useState } from 'react';
import { Building2 } from 'lucide-react';

function VuesaxBulkColorfilter() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/bulk/colorfilter">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="colorfilter">
          <path d={svgPaths.p24d5ffc0} fill="var(--fill-0, #5030E5)" id="Vector" opacity="0.6" />
          <path d={svgPaths.p960d370} fill="var(--fill-0, #5030E5)" id="Vector_2" />
          <path d={svgPaths.p319717b0} fill="var(--fill-0, #5030E5)" id="Vector_3" opacity="0.4" />
          <g id="Vector_4" opacity="0"></g>
        </g>
      </svg>
    </div>
  );
}

interface ApartmentInfoFormProps {
  onSuccess: (message: string) => void;
}

export function ApartmentInfoForm({ onSuccess }: ApartmentInfoFormProps) {
  const [apartmentName, setApartmentName] = useState('BlueMoon Apartments');
  const [address, setAddress] = useState('123 Main Street, City, State 12345');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [email, setEmail] = useState('admin@bluemoon.com');

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
            <input
              type="text"
              value={apartmentName}
              onChange={(e) => setApartmentName(e.target.value)}
              className="w-full h-[44px] px-[16px] bg-input-bg rounded-[6px] border-0 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]"
            />
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-[44px] px-[16px] bg-input-bg rounded-[6px] border-0 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]"
            />
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-[44px] px-[16px] bg-input-bg rounded-[6px] border-0 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]"
            />
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[44px] px-[16px] bg-input-bg rounded-[6px] border-0 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
