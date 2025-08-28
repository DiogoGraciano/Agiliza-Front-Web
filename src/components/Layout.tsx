import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  FileText,
  Settings,
  Users,
  Building2,
  Layers,
  Tag,
  LogOut,
  User,
  Shield,
  Briefcase,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Monitor,
  Ticket,
  Layout as LayoutIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | null;
  description: string;
  submenu?: NavigationItem[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, badge: null, description: 'Painel de controle' },
    { 
      name: 'Atendimento', 
      href: '/queues', 
      icon: Clock, 
      badge: null, 
      description: 'Gerencie o atendimento do sistema',
      submenu: [
        { name: 'Localizações', href: '/locations', icon: MapPin, badge: null, description: 'Gerencie as localizações de atendimento' },
        { name: 'Filas', href: '/queues', icon: Clock, badge: null, description: 'Gerencie as filas de atendimento' },
        { name: 'Mesas', href: '/desks', icon: Monitor, badge: null, description: 'Gerencie as mesas de atendimento' },
        { name: 'Tickets', href: '/tickets', icon: Ticket, badge: null, description: 'Gerencie os tickets de atendimento' },
        { name: 'Layouts', href: '/layouts', icon: LayoutIcon, badge: null, description: 'Gerencie os layouts de atendimento' }
      ]
    },
    { 
      name: 'Ouvidoria', 
      href: '/ouvidoria', 
      icon: MessageCircle, 
      badge: null, 
      description: 'Gerencie todos os manifestos da ouvidoria',
      submenu: [
        { name: 'Manifestos', href: '/manifests', icon: FileText, badge: null, description: 'Gerencie todos os manifestos da ouvidoria' },
        { name: 'Serviços', href: '/services', icon: Settings, badge: null, description: 'Gerencie todos os serviços do sistema' },
        { name: 'Categorias', href: '/categories', icon: Tag, badge: null, description: 'Gerencie todas as categorias do sistema' },
        { name: 'Tipos', href: '/types', icon: Layers, badge: null, description: 'Gerencie todos os tipos do sistema' },
        { name: 'Usuários', href: '/users', icon: Users, badge: null, description: 'Gerencie todos os usuários do sistema' }
      ]
    },
    { 
      name: 'Administração', 
      href: '/admin', 
      icon: Shield, 
      badge: null, 
      description: 'Gerencie a administração do sistema',
      submenu: [
        { name: 'Administradores', href: '/admins', icon: Shield, badge: null, description: 'Gerencie todos os administradores do sistema' },
        { name: 'Setores', href: '/sectors', icon: Briefcase, badge: null, description: 'Gerencie todos os setores do sistema' },
        { name: 'Configurações', href: '/enterprise', icon: Building2, badge: null, description: 'Gerencie a empresa do sistema' },
      ]
    }
  ];

  // Expandir automaticamente o submenu quando uma página de submenu estiver ativa
  useEffect(() => {
    const activeSubmenu = navigation.find(item => 
      item.submenu && item.submenu.some(subItem => isActive(subItem.href))
    );
    
    if (activeSubmenu && !expandedMenus.includes(activeSubmenu.name)) {
      setExpandedMenus(prev => [...prev, activeSubmenu.name]);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const isSubmenuActive = (item: NavigationItem) => {
    if (item.submenu) {
      return item.submenu.some(subItem => isActive(subItem.href));
    }
    return isActive(item.href);
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const renderNavigationItem = (item: NavigationItem, isMobile: boolean = false) => {
    const Icon = item.icon;
    const active = isSubmenuActive(item);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus.includes(item.name);

    if (hasSubmenu) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSubmenu(item.name)}
            className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              active
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
            }`}
          >
            <div className="flex items-center">
              <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className={`h-4 w-4 transition-transform ${active ? 'text-white' : 'text-gray-400'}`} />
            ) : (
              <ChevronRight className={`h-4 w-4 transition-transform ${active ? 'text-white' : 'text-gray-400'}`} />
            )}
          </button>
          
          {isExpanded && (
            <div className="ml-4 mt-2 space-y-1">
              {item.submenu!.map((subItem) => {
                const SubIcon = subItem.icon;
                const subActive = isActive(subItem.href);
                return (
                  <Link
                    key={subItem.name}
                    to={subItem.href}
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      subActive
                        ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-md'
                        : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <SubIcon className={`mr-3 h-4 w-4 ${subActive ? 'text-white' : 'text-gray-400'}`} />
                    {subItem.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg transform scale-105'
            : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
        }`}
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <div className="flex items-center">
          <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
          {item.name}
        </div>
        {item.badge && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            active ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderDesktopNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const active = isSubmenuActive(item);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus.includes(item.name);

    if (hasSubmenu) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSubmenu(item.name)}
            className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 animate-fade-in ${
              active
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:transform hover:scale-102'
            }`}
          >
            <div className="flex items-center">
              <Icon className={`mr-4 h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'}`} />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className={`h-4 w-4 transition-transform ${active ? 'text-white' : 'text-gray-400'}`} />
            ) : (
              <ChevronRight className={`h-4 w-4 transition-transform ${active ? 'text-white' : 'text-gray-400'}`} />
            )}
          </button>
          
          {isExpanded && (
            <div className="ml-4 mt-2 space-y-1">
              {item.submenu!.map((subItem) => {
                const SubIcon = subItem.icon;
                const subActive = isActive(subItem.href);
                return (
                  <Link
                    key={subItem.name}
                    to={subItem.href}
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      subActive
                        ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-md'
                        : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
                    }`}
                  >
                    <SubIcon className={`mr-3 h-4 w-4 ${subActive ? 'text-white' : 'text-gray-400'}`} />
                    {subItem.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 animate-fade-in ${
          active
            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg transform scale-105'
            : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:transform hover:scale-102'
        }`}
      >
        <div className="flex items-center">
          <Icon className={`mr-4 h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'}`} />
          {item.name}
        </div>
        {item.badge && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full animate-pulse ${
            active ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const getCurrentPageInfo = () => {
    // Procura primeiro nos submenus
    for (const item of navigation) {
      if (item.submenu) {
        const subItem = item.submenu.find(sub => isActive(sub.href));
        if (subItem) {
          return { name: subItem.name, description: subItem.description };
        }
      }
    }
    
    // Se não encontrar nos submenus, procura nos itens principais
    const currentItem = navigation.find(item => isActive(item.href));
    return currentItem ? { name: currentItem.name, description: currentItem.description } : { name: 'Dashboard', description: '' };
  };

  const currentPage = getCurrentPageInfo();

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar para mobile */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full glass-effect">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-6 mb-8">
              <div className="h-10 w-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Agiliza</span>
            </div>
            <nav className="px-4 space-y-2">
              {navigation.map((item) => renderNavigationItem(item, true))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 glass-effect border-r border-gray-200/50">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <div className="h-12 w-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">A</span>
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">Agiliza</span>
              </div>
              <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => renderDesktopNavigationItem(item))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-20 glass-effect border-b border-gray-200/50">
          <button
            type="button"
            className="px-4 border-r border-gray-200/50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 md:hidden hover:bg-gray-50 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-6 flex justify-between items-center">
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {currentPage.name}
              </h1>
              <p className="text-sm text-gray-500">{currentPage.description}</p>
            </div>
            <div className="ml-4 flex items-center space-x-4">
              {/* Perfil do usuário */}
              <div className="relative hidden md:block">
                <div className="flex items-center space-x-3 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium text-gray-900">{admin?.name}</span>
                    <span className="text-xs text-gray-500">{admin?.email}</span>
                  </div>
                  <div className="h-10 w-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo da página */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-8">
            <div className="px-6">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
