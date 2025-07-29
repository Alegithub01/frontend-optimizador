export interface Optikids {
  id: number
  name: string
  descripcion1?: string
  descripcion2?: string
  portada1?: string
  portada2?: string
  bandera: string
  videoTutorialUrl?: string
  lessons?: Lesson[]
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
  optikidsId: number // This is for the DTO when creating/updating a lesson
}

export interface CreateOptikidsDto {
  name: string
  descripcion1?: string
  descripcion2?: string
  portada1?: string
  portada2?: string
  bandera: string
  videoTutorialUrl?: string
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
  optikidsId: number
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> {}
