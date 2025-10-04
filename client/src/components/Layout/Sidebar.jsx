import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  CheckCircle, 
  Users, 
  Bell, 
  Settings, 
  User,
  Building2,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle },
    ...(user?.role === 'admin' ? [{ name: 'Users', href: '/users', icon: Users }] : []),
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? '280px' : '72px' }}
      className="bg-gradient-to-b from-card to-card/95 border-r border-border/50 backdrop-blur-sm transition-all duration-300 shadow-lg"
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Building2 className="h-6 w-6 text-white" />
            </motion.div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  ExpenseApp
                </h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {navigation.map((item, index) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <a
                  href={item.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                    "hover:shadow-md hover:shadow-primary/10",
                    "relative overflow-hidden"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </div>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-auto"
                    >
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  )}
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-border/50"
          >
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-muted/50">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role || 'Employee'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
