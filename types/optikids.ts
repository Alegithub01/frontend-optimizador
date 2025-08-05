export interface Optikids {
  id: number
  name: string
  descripcion1?: string
  descripcion2?: string
  portada1?: string
  bandera: string
  videoTutorialUrl?: string
  whatsUrl:string
  whatsText:string
  snapUrl:string
  snapText:string
  lessons?: Lesson[]
  decoracion1?: string // Mantener para el diseño de Figma
  decoracion2?: string // Mantener para el diseño de Figma
}

export interface Lesson {
  id: number | string
  etiqueta: string
  titulo: string
  descripcion?: string
  urlAndroid?: string
  urlIos?: string
  urlVideo?: string
  urlSnap?: string
  urlBg?: string
  urlImage?: string
  optikidsId: number // This is for the DTO when creating/updating a lesson
}

export interface CreateOptikidsDto {
  name: string
  descripcion1?: string
  descripcion2?: string
  portada1?: string
  bandera: string
  videoTutorialUrl?: string
  whatsUrl:string
  whatsText:string
  snapUrl:string
  snapText:string
}

export interface UpdateOptikidsDto extends Partial<CreateOptikidsDto> {}

export interface CreateLessonDto {
  etiqueta: string
  titulo: string
  descripcion?: string
  urlAndroid?: string
  urlIos?: string
  urlVideo?: string
  urlSnap?: string
  urlBg?: string
  urlImage?: string
  optikidsId: number
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> {}
