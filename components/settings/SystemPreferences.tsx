export function SystemPreferences() {
  return (
    <div className="bg-bg-white rounded-[16px] p-[32px] shadow-lg border border-border-light">
      <h3 className="font-semibold text-text-primary text-[20px] mb-[24px]">System Preferences</h3>
      <div className="space-y-[16px]">
        <div className="flex items-center justify-between py-[12px] border-b border-border-light">
          <div>
            <p className="font-medium text-text-primary text-sm">Email Notifications</p>
            <p className="text-text-secondary text-xs mt-[4px]">Receive payment reminders via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5030e5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5030e5]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-[12px] border-b border-border-light">
          <div>
            <p className="font-medium text-text-primary text-sm">SMS Notifications</p>
            <p className="text-text-secondary text-xs mt-[4px]">Receive payment reminders via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5030e5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5030e5]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-[12px] border-b border-border-light">
          <div>
            <p className="font-medium text-text-primary text-sm">Auto Late Fees</p>
            <p className="text-text-secondary text-xs mt-[4px]">Automatically apply late fees after due date</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5030e5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5030e5]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-[12px]">
          <div>
            <p className="font-medium text-text-primary text-sm">Monthly Reports</p>
            <p className="text-text-secondary text-xs mt-[4px]">Generate and email monthly reports</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5030e5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5030e5]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
