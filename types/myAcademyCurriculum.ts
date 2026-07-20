export type MyAcademyMapStatus = 'available' | 'preparing' | 'horizon';

export interface MyAcademyLocalizedText {
  pt: string;
  en: string;
}

export type MyAcademyConnectionType = 'experience' | 'tool' | 'reference';

export interface MyAcademyCurriculumItem {
  id: string;
  kind: 'unit' | 'topic';
  title: MyAcademyLocalizedText;
  status: MyAcademyMapStatus;
  path?: string;
  connectionType?: MyAcademyConnectionType;
  actionLabel?: MyAcademyLocalizedText;
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
