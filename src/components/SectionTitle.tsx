// src/components/SectionTitle.tsx

type SectionTitleProps = {
  title: string;
  subtitle: string;
};

const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="text-center mb-12">
      <h2 className="text-4xl font-medium text-brand-black">{title}</h2>
      {/* PERBAIKAN: Garis oranye dipindahkan ke antara judul dan subjudul */}
      <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
      <p className="text-lg font-light text-brand-gray-1 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
};

export default SectionTitle;
