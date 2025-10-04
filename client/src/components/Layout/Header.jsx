import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  Search,
  Settings
} from 'lucide-react';
import { toggleSidebar, toggleTheme } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

const Header = () => {
  const dispatch = useDispatch();
  const { sidebarOpen, theme } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm border-b border-border/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search expenses, users, or anything..."
                className="pl-10 pr-4 py-2 w-80 border-2 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-200"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-200 relative"
          >
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          <div className="flex items-center space-x-3 pl-3 border-l border-border/50">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
