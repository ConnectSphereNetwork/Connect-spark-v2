"use client"

import { useEffect, useState } from 'react';
import { Card, CardDescription, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface NotificationProps {
  title: string;
  description: string;
  onClose: () => void;
}

export default function NotificationBanner({ title, description, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Animate in
  useEffect(() => {
    setIsVisible(true);
    // Automatically close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Allow animation to finish before calling parent's onClose
    setTimeout(onClose, 300); 
  };

  return (
    <div 
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`}
    >
      <Card className="w-80 shadow-lg border-primary/20">
        <div className="p-4 relative">
          <CardTitle className="text-md">{title}</CardTitle>
          <CardDescription className="mt-1 text-sm">{description}</CardDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1 right-1 h-6 w-6" 
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}