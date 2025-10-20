import { Footer } from "flowbite-react";
import { BsGithub, BsLinkedin, BsTelegram } from "react-icons/bs";
import { Link } from "react-router-dom";

const FooterComponent = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold gradient-text">ExperienceShare</span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Connect with travelers worldwide and share your amazing experiences. Discover new places, create lasting memories, and inspire others.
                </p>
                <div className="flex space-x-4">
                  <a href="https://github.com/HasanRzayev" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" title="GitHub">
                    <BsGithub className="w-5 h-5" />
                  </a>
                  <a href="https://t.me/hasanrzayev" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" title="Telegram">
                    <BsTelegram className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/HasanRzayev/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" title="LinkedIn">
                    <BsLinkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                <ul className="space-y-3">
                  <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link></li>
                  <li><Link to="/featured" className="text-gray-300 hover:text-white transition-colors">Featured Experiences</Link></li>
                  <li><Link to="/travel-tips" className="text-gray-300 hover:text-white transition-colors">Travel Tips</Link></li>
                  <li><Link to="/guidelines" className="text-gray-300 hover:text-white transition-colors">Community Guidelines</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Support</h3>
                <ul className="space-y-3">
                  <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link to="/report" className="text-gray-300 hover:text-white transition-colors">Report Issue</Link></li>
                  <li><Link to="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
                  <li><Link to="/safety" className="text-gray-300 hover:text-white transition-colors">Safety Tips</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Legal</h3>
                <ul className="space-y-3">
                  <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/cookies" className="text-gray-300 hover:text-white transition-colors">Cookie Policy</Link></li>
                  <li><Link to="/content-policy" className="text-gray-300 hover:text-white transition-colors">Content Guidelines</Link></li>
                  <li><Link to="/dmca" className="text-gray-300 hover:text-white transition-colors">DMCA</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/10 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-300 text-sm mb-4 md:mb-0">
                  © 2024 ExperienceShare. All rights reserved. Made with ❤️ for travelers worldwide.
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <span className="text-gray-300">Available on:</span>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">iOS</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Android</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Web</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
    );
  };
  
  export default FooterComponent;
  
