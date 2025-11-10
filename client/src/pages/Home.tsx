import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Shield, Users, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2332] to-[#0f1922] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="w-10 h-10 rounded-lg" />}
            <span className="font-bold text-xl">JSR Algo</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => setShowLogin(true)}
            >
              Login
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0"
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Proven Performance Since 2024</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Master Your <br />
            <span className="gradient-text">Forex Empire</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Professional algorithmic trading solutions designed for serious traders. 
            Choose between aggressive growth or conservative stability—both delivering exceptional results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg px-8 py-6 border-0"
              onClick={() => setShowSignup(true)}
            >
              Start Your Journey!
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white/20 hover:bg-white/10 text-lg px-8 py-6 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          {/* Product Showcase - Scrolling Cards */}
          <div className="relative -mx-4 px-4">
            <div className="overflow-x-auto pb-4 snap-x snap-mandatory">
              <div className="flex gap-6 w-max px-4">
                {/* Aggressive Algo Card */}
                <div className="glass-card rounded-3xl p-6 w-[400px] transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 animate-bounce-slow hover:shadow-2xl hover:shadow-pink-500/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-400">Premium Product</div>
                      <div className="font-semibold text-lg">Aggressive Algo</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Expected Monthly Return</div>
                    <div className="text-3xl font-bold gradient-pink">15-25%</div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>High returns with controlled risk</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Low drawdown protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Works with select platforms only</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 border-0"
                    onClick={() => setShowSignup(true)}
                  >
                    Learn More <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Conservative Algo Card */}
                <div className="glass-card rounded-3xl p-6 w-[400px] transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 animate-pulse-slow hover:shadow-2xl hover:shadow-cyan-500/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-400">Premium Product</div>
                      <div className="font-semibold text-lg">Conservative Algo</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Expected Monthly Return</div>
                    <div className="text-3xl font-bold gradient-text">8-12%</div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Very stable and consistent</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Minimal risk exposure</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Works with all major platforms</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 border-0"
                    onClick={() => setShowSignup(true)}
                  >
                    Learn More <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Scroll indicator */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Swipe to explore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Performance Metrics</h2>
            <p className="text-gray-400">Transparent results from our trading algorithms</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">24 Months</div>
              <div className="text-gray-400">Live Trading History</div>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">94%</div>
              <div className="text-gray-400">Profitable Months</div>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">&lt;8%</div>
              <div className="text-gray-400">Max Drawdown</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Elevate Your Trading?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join our community of traders achieving consistent results with proven algorithms
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg px-8 py-6 border-0"
              onClick={() => setShowSignup(true)}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 relative">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="w-8 h-8 rounded-lg" />}
                <span className="font-bold text-lg">JSR Algo</span>
              </div>
              <p className="text-sm text-gray-400">
                Professional algorithmic trading solutions for serious traders.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Aggressive Algo</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Conservative Algo</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Performance</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Risk Disclosure</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 JSR Algo. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="bg-[#1a2332] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Login to Your Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="login-email" className="text-white">Email</Label>
              <Input id="login-email" type="email" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label htmlFor="login-password" className="text-white">Password</Label>
              <Input id="login-password" type="password" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500"
              />
              <Label htmlFor="remember-me" className="text-white text-sm cursor-pointer">
                Remember me
              </Label>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0"
              onClick={() => {
                setShowLogin(false);
                setLocation("/admin");
              }}
            >
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signup Dialog */}
      <Dialog open={showSignup} onOpenChange={setShowSignup}>
        <DialogContent className="bg-[#1a2332] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create Your Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signup-firstname" className="text-white">First Name</Label>
                <Input id="signup-firstname" className="bg-white/5 border-white/10 text-white" placeholder="John" />
              </div>
              <div>
                <Label htmlFor="signup-lastname" className="text-white">Last Name</Label>
                <Input id="signup-lastname" className="bg-white/5 border-white/10 text-white" placeholder="Doe" />
              </div>
            </div>
            <div>
              <Label htmlFor="signup-email" className="text-white">Email</Label>
              <Input id="signup-email" type="email" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label htmlFor="signup-password" className="text-white">Password</Label>
              <Input id="signup-password" type="password" className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0"
              onClick={() => {
                setShowSignup(false);
                setLocation("/admin");
              }}
            >
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
