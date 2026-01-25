
export const LAYERS = {
  showInlays: { label: "Inlays", default: true },
  showAllNotes: { label: "All Notes", default: false },
  showScale: { label: "Scale Notes", default: true },
  showTonic: { label: "Tonic Highlight", default: true },
};

export type LayerKey = keyof typeof LAYERS;
