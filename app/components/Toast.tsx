export default function Toast() {
  return (
    <div className="flex flex-col gap-8 p-8 min-h-screen text-emerald-400">
      <div className="ascii-box-double text-emerald-400">
        <div className="ascii-box-header">SUCCESS</div>
        <p className="text-sm leading-relaxed text-emerald-300">
        </p>
      </div>

      <div className="ascii-box-double text-amber-500">
        <div className="ascii-box-header">WARNING</div>
        <p className="text-sm leading-relaxed text-amber-400">
        </p>
      </div>
      <div className="ascii-box-double ascii-red">
        <div className="ascii-box-header">ERROR</div>
        <p className="text-sm leading-relaxed">
        </p>
      </div>

      <div className="ascii-box-double ascii-blue">
        <div className="ascii-box-header">INFO</div>
        <p className="text-sm leading-relaxed">
        </p>
      </div>
    </div>
  );
}

