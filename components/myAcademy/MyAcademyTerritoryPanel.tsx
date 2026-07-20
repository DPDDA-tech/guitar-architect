import React from 'react';
import type {
  MyAcademyCurriculumItem,
  MyAcademyCurriculumMoment,
  MyAcademyCurriculumModule,
  MyAcademyMapStatus,
} from '../../types/myAcademyCurriculum';
import {
  getMyAcademyWaypointPresentation,
  shouldShowMyAcademyTerritoryStatus,
} from '../../utils/myAcademyMapPresentation';
import { navigateToPath } from '../../utils/fretboardNavigation';
import MyAcademyIntroTopicContent, {
  isMyAcademyIntroTopicPublished,
} from './MyAcademyIntroTopicContent';

interface MyAcademyTerritoryPanelProps {
  lang: 'pt' | 'en';
  territory: MyAcademyCurriculumMoment;
  hasSelfRecord: boolean;
  selectedModuleId: string;
  onSelectModule: (moduleId: string) => void;
}

type ConnectedResource = {
  path: string;
  label: { pt: string; en: string };
  kind: { pt: string; en: string };
};

const CONNECTED_RESOURCES: Partial<Record<string, ConnectedResource>> = {
  'M0-03-01': {
    path: '/kids/instruments',
    label: { pt: 'Explorar instrumentos', en: 'Explore instruments' },
    kind: { pt: 'Experiência conectada · GA Kids', en: 'Connected experience · GA Kids' },
  },
  'M0-03-02': {
    path: '/kids/instruments',
    label: { pt: 'Ver partes e caminhos do som', en: 'See parts and sound paths' },
    kind: { pt: 'Referência visual · GA Kids', en: 'Visual reference · GA Kids' },
  },
  'M0-03-03': {
    path: '/teens/cuidados-basicos',
    label: { pt: 'Abrir cuidados básicos', en: 'Open basic care' },
    kind: { pt: 'Experiência conectada · GA Teens', en: 'Connected experience · GA Teens' },
  },
  'M0-04-01': {
    path: '/studio',
    label: { pt: 'Explorar o braço no Studio', en: 'Explore the Studio fretboard' },
    kind: { pt: 'Ferramenta conectada · Studio', en: 'Connected tool · Studio' },
  },
};

const MyAcademyTerritoryPanel: React.FC<MyAcademyTerritoryPanelProps> = ({
  lang,
  territory,
  hasSelfRecord,
  selectedModuleId,
  onSelectModule,
}) => {
  const isPt = lang === 'pt';
  const navigation = getMyAcademyWaypointPresentation(territory.id, hasSelfRecord, lang);
  const showTerritoryEditorialStatus = shouldShowMyAcademyTerritoryStatus(territory.id, navigation.isCurrent);
  const selectedModule = territory.modules.find(module => module.id === selectedModuleId) ?? territory.modules[0];

  const statusLabel = (status: MyAcademyMapStatus) => {
    if (status === 'available') return isPt ? 'Disponível agora' : 'Available now';
    if (status === 'horizon') return isPt ? 'Caminho futuro' : 'Future path';
    return isPt ? 'Em desenvolvimento' : 'In development';
  };

  const statusClass = (status: MyAcademyMapStatus) => {
    if (status === 'available') return 'border-cyan-300/45 bg-cyan-300/10 text-cyan-100';
    if (status === 'horizon') return 'border-amber-300/35 bg-amber-300/10 text-amber-100';
    return 'border-slate-600 bg-slate-800/70 text-slate-300';
  };

  const itemStatus = (item: MyAcademyCurriculumItem): MyAcademyMapStatus => (
    isMyAcademyIntroTopicPublished(item.id) ? 'available' : item.status
  );

  const moduleStatus = (module: MyAcademyCurriculumModule): MyAcademyMapStatus => (
    module.items.some(item => itemStatus(item) === 'available')
      ? 'available'
      : territory.status === 'horizon' ? 'horizon' : 'preparing'
  );

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-cyan-900/60 bg-[linear-gradient(145deg,rgba(9,20,36,0.98),rgba(5,12,24,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.25)]" aria-labelledby="selected-territory-title">
      <div className="border-b border-slate-800 bg-white/[0.025] p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
              {isPt ? 'Território selecionado' : 'Selected territory'}
            </p>
            <h3 id="selected-territory-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {territory.title[lang]}
            </h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300 sm:text-base">{territory.description[lang]}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:max-w-[280px] sm:justify-end">
            {showTerritoryEditorialStatus && (
              <span className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${statusClass(territory.status)}`}>
                {statusLabel(territory.status)}
              </span>
            )}
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${navigation.isCurrent ? 'border-amber-300/50 bg-amber-300/10 text-amber-100' : 'border-slate-600 bg-slate-950/50 text-slate-200'}`}>
              {navigation.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(260px,0.38fr)_minmax(0,0.62fr)]">
        <div className="border-b border-slate-800 p-4 lg:border-b-0 lg:border-r sm:p-5">
          <p className="mb-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
            {isPt ? 'Escolha um tema deste território' : 'Choose a topic in this territory'}
          </p>
          <div className="space-y-2" role="group" aria-label={isPt ? `Temas de ${territory.title.pt}` : `Topics in ${territory.title.en}`}>
            {territory.modules.map(module => {
              const selected = module.id === selectedModule?.id;
              const editorialStatus = moduleStatus(module);
              return (
                <button
                  key={module.id}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="selected-module-content"
                  onClick={() => onSelectModule(module.id)}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${selected ? 'border-cyan-300/55 bg-cyan-300/10' : 'border-slate-800 bg-slate-950/45 hover:border-slate-600'}`}
                >
                  <span className="min-w-0 flex-1 text-sm font-black leading-snug text-slate-100">{module.title[lang]}</span>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full border ${editorialStatus === 'available' ? 'border-cyan-200 bg-cyan-300' : editorialStatus === 'horizon' ? 'border-amber-300/70 bg-amber-300/35' : 'border-slate-500 bg-slate-700'}`} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>

        <div id="selected-module-content" className="min-w-0 p-4 sm:p-5 lg:p-6">
          {selectedModule && (
            <>
              <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-cyan-400/65">
                    {isPt ? 'Tema escolhido' : 'Selected topic'}
                  </p>
                  <h4 className="mt-1 text-xl font-black text-white">{selectedModule.title[lang]}</h4>
                </div>
                <span className={`self-start rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] ${statusClass(moduleStatus(selectedModule))}`}>
                  {statusLabel(moduleStatus(selectedModule))}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {selectedModule.items.map(item => {
                  const editorialStatus = itemStatus(item);
                  const connected = CONNECTED_RESOURCES[item.id];
                  const destination = item.path ?? connected?.path;
                  const actionLabel = item.actionLabel?.[lang] ?? connected?.label[lang] ?? (isPt ? 'Abrir recurso' : 'Open resource');
                  return (
                    <li key={item.id} className={`rounded-xl border p-3.5 ${editorialStatus === 'available' ? 'border-cyan-400/35 bg-cyan-950/25' : 'border-slate-800 bg-slate-900/45'}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-relaxed text-slate-200">{item.title[lang]}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] ${statusClass(editorialStatus)}`}>
                              {statusLabel(editorialStatus)}
                            </span>
                            {connected && (
                              <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-amber-100">
                                {connected.kind[lang]}
                              </span>
                            )}
                          </div>
                          {isMyAcademyIntroTopicPublished(item.id) && (
                            <MyAcademyIntroTopicContent itemId={item.id} lang={lang} />
                          )}
                        </div>
                        {destination && (
                          <button
                            type="button"
                            onClick={() => navigateToPath(destination)}
                            className="min-h-11 shrink-0 rounded-xl bg-cyan-600 px-4 text-xs font-black text-white transition hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                          >
                            {item.kind === 'unit' ? (isPt ? 'Começar experiência' : 'Start experience') : actionLabel}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyAcademyTerritoryPanel;
