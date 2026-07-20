export type MyAcademyCompanionId = 'alice' | 'arthur';

export interface MyAcademyCompanionChoice {
  companionId: MyAcademyCompanionId;
  chosenAt: string;
  declaredByUser: true;
  reversible: true;
}

export interface MyAcademyCompanionProfile {
  id: MyAcademyCompanionId;
  name: string;
  image: string;
  title: {
    pt: string;
    en: string;
  };
  invitation: {
    pt: string;
    en: string;
  };
  emphasis: {
    pt: string;
    en: string;
  };
}
