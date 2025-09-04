// components/ui/TestimonialCard.jsx
import Image from 'next/image';

export default function TestimonialCard({ name, role, content, avatar }) {
  return (
    <div className="shadow-sm hover:shadow-md backdrop-blur-sm p-6 border border-white/20 rounded-xl h-full transition-all duration-200">
      <div className="flex items-center mb-4">
        <div className="mr-4 rounded-full w-12 h-12 overflow-hidden">
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <div className="text-gray-600 italic">"{content}"</div>
    </div>
  );
}