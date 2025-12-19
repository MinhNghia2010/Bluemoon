import svgPaths from "../../imports/svg-uiac8iywkt";

export function VuesaxBulkAddSquare({ className }: { className?: string }) {
  return (
    <div className={className} data-name="vuesax/bulk/add-square">
      <div className="absolute contents inset-0" data-name="vuesax/bulk/add-square">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g id="add-square">
            <path d={svgPaths.pd3eef80} fill="currentColor" id="Vector" opacity="0.4" />
            <path d={svgPaths.pc746f40} fill="currentColor" id="Vector_2" />
            <g id="Vector_3" opacity="0"></g>
          </g>
        </svg>
      </div>
    </div>
  );
}

export function VuesaxOutlineArrowDown({ className }: { className?: string }) {
  return (
    <div className={className || "absolute contents inset-0"} data-name="vuesax/outline/arrow-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="arrow-down">
          <path d={svgPaths.p3298ef40} fill="var(--fill-0, #292D32)" id="Vector" />
          <g id="Vector_2" opacity="0"></g>
        </g>
      </svg>
    </div>
  );
}

export function VuesaxBulkColorfilter({ className }: { className?: string }) {
  return (
    <div className={className || "absolute contents inset-0"} data-name="vuesax/bulk/colorfilter">
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
