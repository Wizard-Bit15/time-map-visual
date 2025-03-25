
import React, { useState } from 'react';
import { Clock, Globe, Settings, Info, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMapboxTokenSubmit: (token: string) => void;
  hasMapboxToken: boolean;
}

const Navbar = ({ onMapboxTokenSubmit, hasMapboxToken }: NavbarProps) => {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(!hasMapboxToken);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      onMapboxTokenSubmit(tokenInput.trim());
      setIsTokenModalOpen(false);
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10">
        <div className="glass-morphism mx-4 my-4 px-4 py-3 rounded-full flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="w-6 h-6 text-primary mr-2 animate-pulse-subtle" />
            <h1 className="text-xl font-semibold tracking-tight">TimeMap</h1>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavButton icon={<Clock />} label="Time Zones" />
            <NavButton icon={<Globe />} label="Map" active />
            <NavButton icon={<Settings />} label="Settings" />
            <NavButton icon={<Info />} label="About" />
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden glass-morphism mx-4 mt-1 p-3 rounded-xl animate-fade-in">
            <nav className="flex flex-col space-y-1">
              <MobileNavButton icon={<Clock />} label="Time Zones" />
              <MobileNavButton icon={<Globe />} label="Map" active />
              <MobileNavButton icon={<Settings />} label="Settings" />
              <MobileNavButton icon={<Info />} label="About" />
            </nav>
          </div>
        )}
      </header>
      
      {/* Mapbox token modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full mx-4 p-6 animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Enter Mapbox API Token</h2>
            <p className="text-sm text-muted-foreground mb-4">
              To display the map, please enter your Mapbox API token. 
              You can get one for free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>.
            </p>
            
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter your Mapbox token..."
                className="w-full p-3 rounded-md bg-white/10 border border-white/20 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavButton = ({ icon, label, active = false, onClick }: NavButtonProps) => {
  return (
    <button
      className={cn(
        "flex items-center px-3 py-2 rounded-md transition-all",
        active 
          ? "bg-primary/15 text-primary" 
          : "hover:bg-white/5 text-foreground/80 hover:text-foreground"
      )}
      onClick={onClick}
    >
      <span className="w-5 h-5 mr-2">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};

const MobileNavButton = ({ icon, label, active = false, onClick }: NavButtonProps) => {
  return (
    <button
      className={cn(
        "flex items-center px-3 py-3 rounded-md transition-all",
        active 
          ? "bg-primary/15 text-primary" 
          : "hover:bg-white/5 text-foreground/80 hover:text-foreground"
      )}
      onClick={onClick}
    >
      <span className="w-5 h-5 mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default Navbar;
