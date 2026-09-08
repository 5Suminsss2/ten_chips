export function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex min-w-16 items-center gap-3 px-3 py-3 text-xs font-bold tracking-wider transition ${active ? "bg-[#b5121b] text-white" : "hover:bg-black/5"}`}>
      {icon}
      <span className="hidden sm:inline lg:inline">{label}</span>
    </button>
  );
}
