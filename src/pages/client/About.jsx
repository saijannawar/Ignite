import React from 'react';
import { 
  Cpu, 
  Zap, 
  Users, 
  Package, 
  Award, 
  ArrowRight, 
  BookOpen, 
  Lightbulb 
} from 'lucide-react';

const About = () => {
  // WhatsApp Configuration
  const phoneNumber = "919011401920"; // Your number
  const message = encodeURIComponent("Hi Ignite team, I am interested in a bulk order for components/workshop. Can you please provide a quote?");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="bg-gray-50 min-h-screen font-sans overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#7D2596] text-white py-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold tracking-widest uppercase mb-4 border border-white/30">
            Welcome to Ignite
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Ideas Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white">Reality</span>
          </h1>
          <p className="text-lg md:text-2xl text-purple-100 max-w-3xl mx-auto font-light leading-relaxed">
            Your trusted partner for Electronics, Sensors, Robotics, and Innovation. 
            Empowering students and creators to build the future.
          </p>
        </div>
      </div>

      {/* --- OUR STORY & MISSION --- */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2 relative group">
            <div className="absolute inset-0 bg-[#7D2596] rounded-2xl transform rotate-3 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
            <img 
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
              alt="Innovation" 
              className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover transform transition-transform duration-500 group-hover:-translate-y-2"
            />
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">More Than Just a Component Store</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              At <strong>Ignite</strong>, we understand the thrill of seeing an LED blink for the first time or a robot taking its first step. We aren't just selling sensors and boards; we are providing the fuel for your innovation.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Founded with a vision to bridge the gap between complex technology and students, we specialize in providing high-quality <strong>Arduino boards, IoT modules, Sensors, and Electronic components</strong> at prices that fit a student's budget.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-[#7D2596] rounded-lg"><Zap size={20} /></div>
                <span className="font-bold text-gray-700">Premium Quality</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-[#7D2596] rounded-lg"><Users size={20} /></div>
                <span className="font-bold text-gray-700">Student Focused</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- WHAT WE OFFER --- */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Ignite?</h2>
            <p className="text-gray-500 mt-2">Everything you need to build your dream project.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-gray-50 rounded-2xl p-8 hover:bg-[#7D2596] transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-default">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={32} className="text-[#7D2596]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white">Wide Component Range</h3>
              <p className="text-gray-600 group-hover:text-purple-100 transition-colors">
                From basic resistors to advanced IoT modules like ESP8266 and Arduino, we stock everything your circuit needs.
              </p>
            </div>

            <div className="group bg-gray-50 rounded-2xl p-8 hover:bg-[#7D2596] transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-default">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={32} className="text-[#7D2596]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white">Student Support</h3>
              <p className="text-gray-600 group-hover:text-purple-100 transition-colors">
                We know college projects are tough. We offer guidance, datasheets, and fast campus delivery (VIT Pune) to ensure you meet your deadlines.
              </p>
            </div>

            <div className="group bg-gray-50 rounded-2xl p-8 hover:bg-[#7D2596] transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-default">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package size={32} className="text-[#7D2596]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white">Bulk & Custom Orders</h3>
              <p className="text-gray-600 group-hover:text-purple-100 transition-colors">
                Organizing a workshop or need components for a class? We provide customized bulk kits at unbeatable wholesale prices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BULK ORDER CTA SECTION --- */}
      <div className="container mx-auto px-4 py-20">
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-40">
             <img src="https://images.unsplash.com/photo-1517077304055-6e89abbec40b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Workshop" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#7D2596] to-transparent opacity-90"></div>

          <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
            <div className="max-w-xl">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-yellow-300 font-bold tracking-wider text-sm uppercase">
                <Award size={18} /> For Colleges & Workshops
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">Need Components in Bulk?</h2>
              <p className="text-lg text-purple-100 mb-8">
                We supply custom electronic kits for workshops, hackathons, and college labs. Get the best quotation for your requirement today.
              </p>
              
              {/* ✅ WHATSAPP REDIRECT BUTTON */}
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#7D2596] px-8 py-4 rounded-full font-bold shadow-lg hover:bg-gray-100 hover:scale-105 transition-all w-full md:w-auto justify-center"
              >
                Get a Quote <ArrowRight size={20} />
              </a>

            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-center min-w-[200px] w-full md:w-auto">
               <div className="text-4xl font-extrabold text-white mb-2">1000+</div>
               <div className="text-sm text-purple-200">Projects Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOUNDER'S NOTE --- */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-3xl">
           <Lightbulb size={40} className="text-[#7D2596] mx-auto mb-6" />
           <blockquote className="text-xl md:text-2xl font-medium text-gray-700 italic leading-relaxed mb-6">
             "Innovation shouldn't be expensive. At Ignite, we are committed to making technology accessible to every student with a dream to build something new."
           </blockquote>
           <div className="font-bold text-gray-900">- Team Ignite</div>
        </div>
      </div>

    </div>
  );
};

export default About;