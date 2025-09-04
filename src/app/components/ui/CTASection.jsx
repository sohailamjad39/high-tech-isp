// components/ui/CTASection.jsx
import Link from 'next/link';

export default function CTASection({ 
  title, 
  description, 
  primaryText = "Get Started", 
  secondaryText = "Learn More",
  primaryHref = "/order",
  secondaryHref = "/plans"
}) {
  return (
    <div className="bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] p-8 md:p-12 rounded-2xl text-white text-center">
      <h2 className="mb-4 font-bold text-xl md:text-4xl">{title}</h2>
      <p className="opacity-90 mb-8 text-base md:text-lg">{description}</p>
      <div className="flex sm:flex-row flex-col justify-center gap-4">
        <Link
          href={primaryHref}
          className="bg-white hover:bg-gray-100 shadow-md hover:shadow-lg px-8 py-3 rounded-lg font-medium text-[#2f83aa] transition-colors duration-200"
        >
          {primaryText}
        </Link>
        <Link
          href={secondaryHref}
          className="hover:bg-white/10 px-8 py-3 border-2 border-white rounded-lg font-medium text-white transition-colors duration-200"
        >
          {secondaryText}
        </Link>
      </div>
    </div>
  );
}