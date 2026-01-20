import React from 'react';

const Button = ({ children, variant = 'primary', size = 'medium', className = '', ...props }) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#C85344] text-white hover:bg-[#C85344] cursor-pointer focus:ring-[#C85344]',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300 cursor-pointer focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 cursor-pointer focus:ring-red-500',
  };
  
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;