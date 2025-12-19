export function SystemInformation() {
  return (
    <div className="bg-bg-white rounded-[16px] p-[32px] shadow-lg border border-border-light">
      <h3 className="font-semibold text-text-primary text-[20px] mb-[24px]">System Information</h3>
      <div className="space-y-[16px]">
        <div className="flex items-center justify-between py-[12px] border-b border-border-light">
          <p className="font-medium text-text-secondary text-sm">System Version</p>
          <p className="text-text-primary text-sm">BlueMoon v2.0</p>
        </div>

        <div className="flex items-center justify-between py-[12px] border-b border-border-light">
          <p className="font-medium text-text-secondary text-sm">Total Households</p>
          <p className="text-text-primary text-sm">9 units</p>
        </div>

        <div className="flex items-center justify-between py-[12px] border-b border-border-light">
          <p className="font-medium text-text-secondary text-sm">Active Fee Categories</p>
          <p className="text-text-primary text-sm">6 categories</p>
        </div>

        <div className="flex items-center justify-between py-[12px] border-b border-border-light">
          <p className="font-medium text-text-secondary text-sm">Last Backup</p>
          <p className="text-text-primary text-sm">November 26, 2025</p>
        </div>

        <div className="flex items-center justify-between py-[12px]">
          <p className="font-medium text-text-secondary text-sm">Database Status</p>
          <div className="flex items-center gap-[8px]">
            <div className="w-[8px] h-[8px] rounded-full bg-[#7AC555]" />
            <p className="text-text-primary text-sm">Active</p>
          </div>
        </div>
      </div>

      <div className="mt-[24px] space-y-[12px]">
        <button className="w-full h-[44px] border border-border-default text-text-secondary rounded-[6px] font-medium text-sm hover:bg-bg-hover transition-colors">
          Export Data
        </button>
        <button className="w-full h-[44px] border border-border-default text-text-secondary rounded-[6px] font-medium text-sm hover:bg-bg-hover transition-colors">
          Backup Database
        </button>
      </div>
    </div>
  );
}
