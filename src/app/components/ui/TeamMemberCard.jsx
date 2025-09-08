// components/ui/TeamMemberCard.jsx
import Image from 'next/image';

export default function TeamMemberCard({ name, role, bio, avatar, socialLinks }) {
  return (
    <div className="bg-white/80 shadow-sm hover:shadow-md backdrop-blur-sm border border-white/20 rounded-xl h-full overflow-hidden scale-95 transition-all duration-200">
      <div className="relative h-64">
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-fit"
          quality={75}
          priority={false}
        />
      </div>
      <div className="p-6">
        <h3 className="mb-1 font-semibold text-gray-800 text-xl">{name}</h3>
        <p className="mb-3 text-blue-600">{role}</p>
        <p className="mb-4 text-gray-600 text-sm">{bio}</p>
        {socialLinks && (
          <div className="flex space-x-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                aria-label={link.platform}
              >
                {link.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}