'use client';

import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Testimonial } from '@/types/testimonial';

interface TestimonialDetailProps {
  testimonial: Testimonial;
  onBack: () => void;
}

export const TestimonialDetail: React.FC<TestimonialDetailProps> = ({ 
  testimonial, 
  onBack 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver a historias
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Sparkles size={24} className="text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {testimonial.name}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {testimonial.title}
          </p>
          
          {/* Diamond Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl transform rotate-45">
              <div className="w-8 h-8 bg-white rounded-sm transform -rotate-45"></div>
            </div>
          </div>
          
          {/* Quote */}
          <blockquote className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
            "{testimonial.quote}"
          </blockquote>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Story Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historia</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {testimonial.story}
            </p>
            
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-4">
              {testimonial.galleryImages.map((image, index) => (
                <div key={index} className="aspect-square rounded-2xl overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Galería ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Profile Image */}
          <div className="lg:order-first">
            <div className="relative">
              <img 
                src={testimonial.image} 
                alt={testimonial.name}
                className="w-full aspect-[4/5] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
            </div>
          </div>
        </div>
        
        {/* Elements Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            ELEMENTOS
          </h2>
          <div className="space-y-4">
            {testimonial.elements.map((element) => (
              <div 
                key={element.id} 
                className="flex items-center space-x-4 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${element.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                  {element.icon}
                </div>
                <span className="text-lg font-medium text-gray-900">
                  {element.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};