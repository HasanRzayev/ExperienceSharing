import { Footer } from "flowbite-react";
import { BsGithub, BsLinkedin, BsTelegram } from "react-icons/bs";
import { Link } from "react-router-dom";

const FooterComponent = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <div className="mb-6 flex items-center space-x-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                    <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="gradient-text text-2xl font-bold">ExperienceShare</span>
                </div>
                <p className="mb-6 leading-relaxed text-gray-300">
                  Connect with travelers worldwide and share your amazing experiences. Discover new places, create lasting memories, and inspire others.
                </p>
                <div className="flex space-x-4">
                  <a href="https://github.com/HasanRzayev" target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20" title="GitHub">
                    <BsGithub className="size-5" />
                  </a>
                  <a href="https://t.me/hasanrzayev" target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20" title="Telegram">
                    <BsTelegram className="size-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/HasanRzayev/" target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20" title="LinkedIn">
                    <BsLinkedin className="size-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="mb-6 text-lg font-semibold">Quick Links</h3>
                <ul className="space-y-3">
                  <li><Link to="/about" className="text-gray-300 transition-colors hover:text-white">About Us</Link></li>
                  <li><Link to="/how-it-works" className="text-gray-300 transition-colors hover:text-white">How It Works</Link></li>
                  <li><Link to="/featured" className="text-gray-300 transition-colors hover:text-white">Featured Experiences</Link></li>
                  <li><Link to="/travel-tips" className="text-gray-300 transition-colors hover:text-white">Travel Tips</Link></li>
                  <li><Link to="/guidelines" className="text-gray-300 transition-colors hover:text-white">Community Guidelines</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="mb-6 text-lg font-semibold">Support</h3>
                <ul className="space-y-3">
                  <li><Link to="/help" className="text-gray-300 transition-colors hover:text-white">Help Center</Link></li>
                  <li><Link to="/contact" className="text-gray-300 transition-colors hover:text-white">Contact Us</Link></li>
                  <li><Link to="/report" className="text-gray-300 transition-colors hover:text-white">Report Issue</Link></li>
                  <li><Link to="/faq" className="text-gray-300 transition-colors hover:text-white">FAQ</Link></li>
                  <li><Link to="/safety" className="text-gray-300 transition-colors hover:text-white">Safety Tips</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="mb-6 text-lg font-semibold">Legal</h3>
                <ul className="space-y-3">
                  <li><Link to="/privacy" className="text-gray-300 transition-colors hover:text-white">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-gray-300 transition-colors hover:text-white">Terms of Service</Link></li>
                  <li><Link to="/cookies" className="text-gray-300 transition-colors hover:text-white">Cookie Policy</Link></li>
                  <li><Link to="/content-policy" className="text-gray-300 transition-colors hover:text-white">Content Guidelines</Link></li>
                  <li><Link to="/dmca" className="text-gray-300 transition-colors hover:text-white">DMCA</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 border-t border-white/10 pt-8">
              <div className="flex flex-col items-center justify-between md:flex-row">
                <div className="mb-4 text-sm text-gray-300 md:mb-0">
                  © 2024 ExperienceShare. All rights reserved. Made with ❤️ for travelers worldwide.
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <span className="text-gray-300">Available on:</span>
                  <a href="#" className="text-gray-300 transition-colors hover:text-white">iOS</a>
                  <a href="#" className="text-gray-300 transition-colors hover:text-white">Android</a>
                  <a href="#" className="text-gray-300 transition-colors hover:text-white">Web</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
    );
  };
  
  export default FooterComponent;
  
