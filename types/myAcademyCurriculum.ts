export type MyAcademyMapStatus = 'available' | 'preparing' | 'horizon';

export interface MyAcademyLocalizedText {
  pt: string;
  en: string;
}

export interface MyAcademyCurriculumItem {
  id: string;
  kind: 'unit' | 'topic';
  title: MyAcademyLocalizedText;
  status: MyAcademyMapStatus;
  path?: '/my-academy/prototype/nmc-rit-001';
}

export interface MyAcademyCurriculumModule {
  id: string;
  title: MyAcademyLocalizedText;
  items: MyAcademyCurriculumItem[];
}

export interface MyAcademyCurriculumMoment {
  id: '0' | '1' | '2' | '3' | '4' | '5' | '6';
  title: MyAcademyLocalizedText;
  description: MyAcademyLocalizedText;
  status: MyAcademyMapStatus;
  sourceLabel?: string;
  modules: MyAcademyCurriculumModule[];
}
