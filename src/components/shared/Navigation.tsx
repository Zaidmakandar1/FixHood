import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Menu, X, Home, Briefcase, User, LogOut } from 'lucide-react';
import BotChatModal from '../BotChatModal';
import { MessageSquare } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [botModalOpen, setBotModalOpen] = useState(false);
  const { user, logout, role } = useUser();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path: string) => location.pathname === path;

  // Ensure we have a valid role
  if (!role) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full bg-primary-100 shadow-md z-50">
      <div className="container-custom mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <Link to={role === 'homeowner' ? '/homeowner' : '/fixer'} className="flex items-center">
            <div className="w-10 h-10 bg-primary-500 text-primary-950 rounded-full flex items-center justify-center mr-2">
              <span className="text-lg font-bold">F</span>
            </div>
            <span className="text-xl font-bold text-primary-800">FixItLocal</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {role === 'homeowner' ? (
              <>
                <NavLink to="/homeowner" isActive={isActive('/homeowner')}>
                  <Home size={18} />
                  <span>Dashboard</span>
                </NavLink>
                <button
                  className="flex items-center space-x-1 text-primary-700 hover:text-primary-900 transition-colors"
                  onClick={() => setBotModalOpen(true)}
                  title="Chat with Bot"
                >
                  <MessageSquare size={18} />
                  <span>AIchat</span>
                </button>
                <NavLink to="/jobs/create" isActive={isActive('/jobs/create')}>
                  <Briefcase size={18} />
                  <span>Post Job</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/fixer" isActive={isActive('/fixer')}>
                  <Home size={18} />
                  <span>Dashboard</span>
                </NavLink>
                <button
                  className="flex items-center space-x-1 text-primary-700 hover:text-primary-900 transition-colors"
                  onClick={() => setBotModalOpen(true)}
                  title="Chat with Bot"
                >
                  <MessageSquare size={18} />
                  <span>AIchat</span>
                </button>
                <NavLink to="/jobs" isActive={isActive('/jobs')}>
                  <Briefcase size={18} />
                  <span>Find Jobs</span>
                </NavLink>
              </>
            )}
            <NavLink to="/profile" isActive={isActive('/profile')}>
              <User size={18} />
              <span>Profile</span>
            </NavLink>
            <button 
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="flex items-center space-x-1 text-primary-700 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-primary-700 hover:text-primary-900 focus:outline-none focus:text-primary-900"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-50 shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {role === 'homeowner' ? (
              <>
                <MobileNavLink to="/homeowner" onClick={closeMenu} isActive={isActive('/homeowner')}>
                  <Home size={18} />
                  <span>Dashboard</span>
                </MobileNavLink>
                <MobileNavLink to="/jobs/create" onClick={closeMenu} isActive={isActive('/jobs/create')}>
                  <Briefcase size={18} />
                  <span>Post Job</span>
                </MobileNavLink>
              </>
            ) : (
              <>
                <MobileNavLink to="/fixer" onClick={closeMenu} isActive={isActive('/fixer')}>
                  <Home size={18} />
                  <span>Dashboard</span>
                </MobileNavLink>
                <MobileNavLink to="/jobs" onClick={closeMenu} isActive={isActive('/jobs')}>
                  <Briefcase size={18} />
                  <span>Find Jobs</span>
                </MobileNavLink>
              </>
            )}
            <MobileNavLink to="/profile" onClick={closeMenu} isActive={isActive('/profile')}>
              <User size={18} />
              <span>Profile</span>
            </MobileNavLink>
            <button 
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="flex items-center w-full px-4 py-2 text-primary-700 hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
      <BotChatModal open={botModalOpen} onClose={() => setBotModalOpen(false)} />
    </nav>
  );
};

// Desktop NavLink component
const NavLink = ({ to, children, isActive }: { to: string; children: React.ReactNode; isActive: boolean }) => (
  <Link 
    to={to}
    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors
      ${isActive 
        ? 'bg-primary-200 text-primary-900' 
        : 'text-primary-700 hover:bg-primary-100'
      }`}
  >
    {children}
  </Link>
);

// Mobile NavLink component
const MobileNavLink = ({ 
  to, 
  children, 
  onClick,
  isActive
}: { 
  to: string; 
  children: [React.ReactNode, React.ReactNode]; 
  onClick: () => void;
  isActive: boolean;
}) => (
  <Link 
    to={to}
    onClick={onClick}
    className={`flex items-center px-4 py-2 
      ${isActive 
        ? 'bg-primary-200 text-primary-900' 
        : 'text-primary-700 hover:bg-primary-100'
      }`}
  >
    <span className="mr-2">{children[0]}</span>
    {children[1]}
  </Link>
);

export default Navigation;