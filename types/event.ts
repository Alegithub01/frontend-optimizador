export interface EventSection {
  title: string;
  content: string;
}

export interface Event {
  id?: string;
  name: string;
  organizer: string;
  price: number;
  image: string;
  capacity: number;
  registered: number;
  category: string;
  subCategory: string;
  description: string;
  sections: EventSection[];
  trailerUrl: string;
  location: string;
  eventDate: string;
  eventTime: string;
  duration: string; // ej: "2 horas", "1 día"
}

export type CreateEventDto = Omit<Event, 'id'>;
export type UpdateEventDto = Partial<CreateEventDto>;