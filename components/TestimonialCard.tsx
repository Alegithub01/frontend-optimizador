'use client';

import React, { useState } from 'react';
import { Play, User } from 'lucide-react';
import { Testimonial } from '@/types/testimonial';

interface TestimonialCardProps {
  testimonial: Testimonial;
  onClick: () => void;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  onClick 
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVideoPlaying(true);
  };

  const handleCardClick = () => {
    if (!isVideoPlaying) {
      onClick();
    }
  };

  return (
    <div 
      className="relative bg-gray-900 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
      onClick={handleCardClick}
    >
      {/* Background Image */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {!isVideoPlaying ? (
          <>
            <img 
              src={testimonial.image} 
              alt={testimonial.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 group-hover:bg-opacity-50" />
          </>
        ) : (
          <iframe
            src={`https://player.vimeo.com/video/${testimonial.vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`Video testimonial de ${testimonial.name}`}
          />
        )}
        
        {/* Play Button */}
        {!isVideoPlaying && (
          <button
            onClick={handlePlayClick}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 hover:scale-110"
          >
            <Play size={20} fill="white" />
          </button>
        )}
        
        {/* "Conoce su historia" Button */}
        {!isVideoPlaying && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              Conoce su historia →
            </span>
          </div>
        )}
      </div>
      
      {/* User Info */}
      {!isVideoPlaying && (
        <div className="absolute -bottom-6 left-4 right-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{testimonial.name}</h3>
                <p className="text-sm text-gray-600 truncate">{testimonial.title}</p>
              </div>
              <div className="text-gray-400">
                <svg width="6" height="12" viewBox="0 0 6 12" fill="currentColor">
                  <path d="M1 1l4 5-4 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};