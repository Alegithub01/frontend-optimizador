export interface Testimonial {
  id: string;
  name: string;
  title: string;
  image: string;
  vimeoId: string;
  quote: string;
  story: string;
  elements: Element[];
  galleryImages: string[];
}

export interface Element {
  id: string;
  name: string;
  color: string;
  icon: string;
}