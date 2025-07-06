"use client"
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { VimeoPlayer } from './VimeoPlayer';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  country: string;
  image: string;
  vimeoId: string;
  iconColor: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const handleSlideChange = (index: number) => {
    if (index < 0) {
      setActiveIndex(testimonials.length - 1);
    } else if (index >= testimonials.length) {
      setActiveIndex(0);
    } else {
      setActiveIndex(index);
    }
    setPlayingVideo(null); // Stop any playing video when changing slides
  };

  const handlePlayVideo = (vimeoId: string) => {
    setPlayingVideo(vimeoId);
  };

  const getVisibleTestimonials = () => {
    const result = [];
    const prevIndex = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
    result.push(testimonials[prevIndex]);
    result.push(testimonials[activeIndex]);
    const nextIndex = activeIndex === testimonials.length - 1 ? 0 : activeIndex + 1;
    result.push(testimonials[nextIndex]);
    return result;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="container mx-auto py-12 md:py-20 px-4">
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 md:mb-12">
        <div className="text-center">
          <h2 className="text-lg font-medium text-orange-500 mb-3">Categoría</h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black">TESTIMONIOS</h3>
        </div>
      </div>

      {/* Mobile Layout - Single testimonial */}
      <div className="block md:hidden mb-8">
        <div className="relative">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="absolute top-4 left-4 text-white z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="relative h-[500px]">
              {playingVideo === testimonials[activeIndex].vimeoId ? (
                <VimeoPlayer videoUrl={playingVideo} />
              ) : (
                <>
                  <img
                    src={testimonials[activeIndex].image}
                    alt={testimonials[activeIndex].name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                    <button
                      onClick={() => handlePlayVideo(testimonials[activeIndex].vimeoId)}
                      className="bg-white/80 rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                      aria-label="Reproducir testimonio"
                    >
                      <Play className="h-6 w-6 text-gray-800 fill-gray-800 ml-1" />
                    </button>
                  </div>
                </>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: testimonials[activeIndex].iconColor }}
                  >
                    {testimonials[activeIndex].name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{testimonials[activeIndex].name}</h4>
                    <p className="text-sm text-gray-500">
                      {testimonials[activeIndex].title} {testimonials[activeIndex].country}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Buttons */}
          <button
            onClick={() => handleSlideChange(activeIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
            aria-label="Testimonio anterior"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>

          <button
            onClick={() => handleSlideChange(activeIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
            aria-label="Siguiente testimonio"
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Desktop Layout - Three testimonials */}
      <div className="hidden md:block relative mb-12">
        <button
          onClick={() => handleSlideChange(activeIndex - 1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors -ml-4"
          aria-label="Testimonio anterior"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>

        <div className="flex justify-center items-center gap-4 md:gap-6">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`relative transition-all duration-300 rounded-2xl overflow-hidden ${
                index === 1 ? "z-10 scale-110 shadow-xl" : "scale-90 opacity-80"
              }`}
            >
              {index === 1 && (
                <div className="absolute top-4 left-4 text-white z-10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="white"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              <div className="relative h-[500px] md:h-[600px] w-[280px] md:w-[350px]">
                {playingVideo === testimonial.vimeoId ? (
                  <VimeoPlayer videoUrl={playingVideo}/>
                ) : (
                  <>
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                      <button
                        onClick={() => handlePlayVideo(testimonial.vimeoId)}
                        className="bg-white/80 rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                        aria-label="Reproducir testimonio"
                      >
                        <Play className="h-6 w-6 text-gray-800 fill-gray-800 ml-1" />
                      </button>
                    </div>
                 </>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-white p-3 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: testimonial.iconColor }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-gray-500">
                        {testimonial.title} {testimonial.country}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleSlideChange(activeIndex + 1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors -mr-4"
          aria-label="Siguiente testimonio"
        >
          <ChevronRight className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {/* Indicadores de navegación */}
      <div className="flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? "bg-gray-800 w-4" : "bg-gray-300"
            }`}
            aria-label={`Ir al testimonio ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}