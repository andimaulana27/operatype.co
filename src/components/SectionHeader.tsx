// src/components/SectionHeader.tsx

const SectionHeader = ({ title }: { title: string }) => {
  return (
    <div>
      <h3 className="text-2xl font-medium text-brand-black">{title}</h3>
      <div className="w-16 h-[3px] bg-brand-orange mt-3 mb-6"></div>
    </div>
  );
};

export default SectionHeader;
