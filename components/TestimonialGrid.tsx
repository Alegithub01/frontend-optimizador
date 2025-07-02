'use client';

import React from 'react';
import { TestimonialCard } from './TestimonialCard';
import { testimonials } from '@/data/testimonials';

interface TestimonialGridProps {
  onTestimonialClick: (id: string) => void;
}

export const TestimonialGrid: React.FC<TestimonialGridProps> = ({ 
  onTestimonialClick 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="pb-8">
              <TestimonialCard
                testimonial={testimonial}
                onClick={() => onTestimonialClick(testimonial.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};