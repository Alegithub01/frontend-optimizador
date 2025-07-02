'use client';

import React, { useState } from 'react';
import { TestimonialGrid } from '@/components/TestimonialGrid';
import { TestimonialDetail } from '@/components/TestimonialDetail';
import { testimonials } from '@/data/testimonials';

export default function TestimonialsPage() {
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);

  const selectedTestimonial = selectedTestimonialId 
    ? testimonials.find(t => t.id === selectedTestimonialId)
    : null;

  const handleTestimonialClick = (id: string) => {
    setSelectedTestimonialId(id);
  };

  const handleBack = () => {
    setSelectedTestimonialId(null);
  };

  return (
    <div className="testimonials-page">
      {selectedTestimonial ? (
        <TestimonialDetail 
          testimonial={selectedTestimonial}
          onBack={handleBack}
        />
      ) : (
        <TestimonialGrid 
          onTestimonialClick={handleTestimonialClick}
        />
      )}
    </div>
  );
}