import React, { ReactNode } from 'react';

interface GlassContainerProps {
  children: ReactNode;
  className?: string;
  darker?: boolean;
}

const GlassContainer: React.FC<GlassContainerProps> = ({ 
  children, 
  className = '', 
  darker = false 
}) => {
  return (
    <div className={`${darker ? 'glass-dark' : 'glass'} ${className}`}>
      {children}
    </div>
  );
};

export default GlassContainer;