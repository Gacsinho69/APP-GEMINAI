
import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 p-2 text-xs text-white bg-gray-700 rounded-md shadow-lg -mt-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-90">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-gray-700 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
