// app/about/page.jsx
"use client"
import Image from 'next/image';
import CardWithIcon from '../components/ui/CardWithIcon';
import FeatureGrid from '../components/ui/FeatureGrid';
import TestimonialCard from '../components/ui/TestimonialCard';
import StatsCounter from '../components/ui/StatsCounter';
import TeamMemberCard from '../components/ui/TeamMemberCard';
import CTASection from '../components/ui/CTASection';

// Icons
function RocketIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

export default function AboutPage() {
  // Team members data
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "With over 15 years of experience in telecommunications, Sarah founded HIGH TECH to revolutionize internet access in underserved communities.",
      avatar: "/about/user.svg",
      socialLinks: [
        {
          platform: "LinkedIn",
          url: "#",
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          )
        }
      ]
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Michael leads our technology team with a focus on network innovation and customer experience optimization.",
      avatar: "/about/user.svg",
      socialLinks: [
        {
          platform: "LinkedIn",
          url: "#",
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          )
        }
      ]
    },
    {
      name: "David Rodriguez",
      role: "Network Operations Director",
      bio: "David oversees our infrastructure deployment and ensures 99.9% network uptime for our customers.",
      avatar: "/about/user.svg",
      socialLinks: [
        {
          platform: "LinkedIn",
          url: "#",
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          )
        }
      ]
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Jennifer Wilson",
      role: "Home User",
      content: "HIGH TECH transformed our remote work experience. The fiber connection is rock solid and their customer service is exceptional.",
      avatar: "/about/user.svg",
    },
    {
      name: "Robert Kim",
      role: "Small Business Owner",
      content: "As a small business, reliable internet is crucial. HIGH TECH's business plan with static IP and priority support has been a game-changer.",
      avatar: "/about/user.svg",
    },
    {
      name: "Emma Thompson",
      role: "Family Customer",
      content: "We've tried several providers, but HIGH TECH is by far the most reliable. Streaming, gaming, homework - everything works perfectly.",
      avatar: "/about/user.svg",
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">

        {/* Content */}
        <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-bold text-gray-800 text-3xl md:text-4xl md:text-5xl lg:text-6xl">
              About HIGH TECH
            </h1>
            <p className="mb-2 md:mb-8 text-gray-600 text-lg md:text-xl">
              We're on a mission to connect communities with the fastest, most reliable internet possible.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-5 md:py-15">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="items-center gap-12 grid grid-cols-1 lg:grid-cols-2">
            <div>
              <h2 className="mx-2 md:mx-auto mb-6 font-bold text-gray-800 text-2xl md:text-3xl">Our Mission</h2>
              <p className="mx-2 md:mx-auto mb-6 md:mb-6 text-gray-600 text-sm md:text-lg">
                At HIGH TECH, we believe that high-speed internet should be accessible, affordable, and reliable for everyone. 
                We're committed to bridging the digital divide by bringing fiber-optic technology to communities that have 
                been underserved by traditional providers.
              </p>
              <p className="mx-2 md:mx-auto mb-2 md:mb-6 text-gray-600 text-sm md:text-lg">
                Our network is built with the latest technology and redundant infrastructure to ensure 99.9% uptime. 
                We don't just provide internet—we provide a platform for innovation, education, and economic growth.
              </p>
            </div>
            <div className="relative shadow-lg rounded-xl h-80 overflow-hidden">
              <Image
                src="/about/networkInfrastructure.jpg"
                alt="Our network infrastructure"
                fill
                className="opacity-85 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="mx-2 md:mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-gray-800 text-2xl md:text-3xl">Our Core Values</h2>
            <p className="text-gray-600 text-lg md:text-xl">What drives everything we do</p>
          </div>

          <FeatureGrid columns={3}>
            <CardWithIcon icon={<RocketIcon />} title="Speed & Innovation">
              We're constantly pushing the boundaries of what's possible with internet technology. 
              Our network is built for the future, not just the present.
            </CardWithIcon>

            <CardWithIcon icon={<ShieldIcon />} title="Reliability & Security">
              We take network uptime and customer data security seriously. 
              Our redundant systems ensure you're always connected.
            </CardWithIcon>

            <CardWithIcon icon={<UsersIcon />} title="Customer Focus">
              Our customers are at the heart of everything we do. 
              From installation to support, we're here to make your experience exceptional.
            </CardWithIcon>
          </FeatureGrid>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] py-20 text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl">By the Numbers</h2>
            <p className="opacity-90 text-xl">Our impact on communities</p>
          </div>

          <div className="gap-8 grid grid-cols-2 md:grid-cols-4 text-center">
            <StatsCounter value={1500} label="Happy Customers" suffix="+" />
            <StatsCounter value={50} label="Miles of Fiber" suffix="+" />
            <StatsCounter value={99} label="Network Uptime" suffix="%" />
            <StatsCounter value={24} label="Hour Support" suffix="/7" />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-gray-800 text-xl md:text-3xl">Meet Our Leadership Team</h2>
            <p className="text-gray-600 text-lg md:text-xl">Experts with decades of experience in telecommunications</p>
          </div>

          <FeatureGrid columns={3}>
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} {...member} />
            ))}
          </FeatureGrid>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-gray-800 text-xl md:text-3xl">What Our Customers Say</h2>
            <p className="text-gray-600 text-lg md:text-xl">Real stories from our community</p>
          </div>

          <FeatureGrid columns={3}>
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </FeatureGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <CTASection 
            title="Ready to Experience the HIGH TECH Difference?"
            description="Join thousands of satisfied customers who have made the switch to faster, more reliable internet."
            primaryText="Get Connected"
            secondaryText="View Plans"
            primaryHref="/order"
            secondaryHref="/plans"
          />
        </div>
      </section>
    </div>
  );
}