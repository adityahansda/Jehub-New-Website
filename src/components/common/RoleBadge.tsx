import React from 'react';
import { Shield, Users, BookOpen, Award, User } from 'lucide-react';
import { UserRole, getRoleDisplayName, getRoleBadgeClass } from '../../hooks/useRoleVerification';

interface RoleBadgeProps {
  role: UserRole | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}) => {
  if (!role) return null;

  const getRoleIcon = (role: UserRole) => {
    const iconClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    const iconClass = iconClasses[size];

    switch (role) {
      case 'admin':
        return <Shield className={iconClass} />;
      case 'manager':
        return <Users className={iconClass} />;
      case 'intern':
        return <Award className={iconClass} />;
      case 'student':
        return <BookOpen className={iconClass} />;
      case 'user':
      default:
        return <User className={iconClass} />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs font-medium';
      case 'lg':
        return 'px-4 py-2 text-base font-semibold';
      case 'md':
      default:
        return 'px-3 py-1 text-sm font-medium';
    }
  };

  const baseClasses = 'inline-flex items-center rounded-full border';
  const sizeClasses = getSizeClasses();
  const colorClasses = getRoleBadgeClass(role);
  const spacing = showIcon ? 'gap-1.5' : '';

  return (
    <span className={`${baseClasses} ${sizeClasses} ${colorClasses} ${spacing} ${className}`}>
      {showIcon && getRoleIcon(role)}
      {getRoleDisplayName(role)}
    </span>
  );
};

export default RoleBadge;
