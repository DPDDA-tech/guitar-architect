
import type { jsPDF } from 'jspdf';
import { Lang, translations } from '../i18n';
import { SCALES } from '../music/scales';
import { InstrumentType } from '../types';
import { getBrandAssets } from './brandAssets';

const createExportWrapper = (lang: Lang) => {
  const wrapper = document.createElement('div');
  wrapper.style.padding = '80px';
  wrapper.style.background = '#ffffff';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '80px';
  wrapper.style.width = '1400px'; 
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  return wrapper;
};

const createDidacticCard = (container: Element, lang: Lang, user: string, userLogo?: string, fallbackInstrument: InstrumentType = 'guitar-6') => {
  const t = translations[lang];
  const parent = container.closest('.diagram-container');
  const instrumentType = ((parent?.getAttribute('data-instrument-type') || fallbackInstrument) as InstrumentType);
  const isScaleActive = parent?.getAttribute('data-scale-active') === 'true';
  const brand = getBrandAssets(instrumentType);
  
  const titleInput = parent?.querySelector('input[placeholder*="Título"]') as HTMLInputElement;
  const title = titleInput?.value || "";
  
  const subtitleInput = parent?.querySelector('input[placeholder*="Subtítulo"]') as HTMLInputElement;
  const subtitle = subtitleInput?.value || "";

  const notesTextarea = parent?.querySelector('textarea') as HTMLTextAreaElement;
  const notes = notesTextarea?.value || "";
  
  const root = parent?.getAttribute('data-root') || "C";
  const scaleNameInternal = parent?.getAttribute('data-scale-type') || "Major (Ionian)";
  const tuning = parent?.getAttribute('data-tuning') || "Standard";
  
  const localizedScaleName = (t.scales && (t.scales as any)[scaleNameInternal]) || scaleNameInternal;
  const scaleDef = SCALES.find(s => s.name === scaleNameInternal);
  const mainTitle = isScaleActive
    ? `${root} ${localizedScaleName}`
    : title;

  const card = document.createElement('div');
  card.style.background = '#fcfcfc';
  card.style.borderRadius = '50px';
  card.style.padding = '60px';
  card.style.border = '4px solid #f1f5f9';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.gap = '40px';
  card.style.boxShadow = '0 30px 60px rgba(0,0,0,0.03)';

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 6px solid ${brand.accent}; padding-bottom: 40px;">
       <div style="display: flex; gap: 30px; align-items: flex-start; flex: 1;">
          <!-- APP BRANDING LOGO (Logo Oficial) -->
          <div style="width: 100px; height: 100px; display: flex; items-center; justify-center; overflow: hidden;">
             <img src="${brand.logo}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 5px 15px ${brand.accentShadow});" />
          </div>
          <div style="flex: 1">
             ${mainTitle ? `<h1 style="font-family: sans-serif; font-weight: 900; font-style: italic; font-size: 50px; color: #0f172a; margin: 0; text-transform: uppercase; line-height: 0.9;">${mainTitle}</h1>` : ''}
             ${isScaleActive && scaleDef?.formula ? `<p style="font-family: sans-serif; font-weight: 900; font-size: 24px; color: ${brand.accent}; margin-top: 10px; letter-spacing: 10px; opacity: 0.8;">${scaleDef.formula}</p>` : ''}
             ${title && isScaleActive ? `<p style="font-family: sans-serif; font-weight: 900; font-size: 22px; color: #1e293b; margin-top: 10px; text-transform: uppercase;">${title}</p>` : ''}
             ${subtitle ? `<p style="font-family: sans-serif; font-weight: bold; font-size: 14px; color: #64748b; margin-top: 5px; text-transform: uppercase;">${subtitle}</p>` : ''}
          </div>
       </div>
       <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 20px;">
          ${userLogo ? `<div style="height: 100px; width: 300px; display: flex; align-items: center; justify-content: flex-end;"><img src="${userLogo}" style="max-height: 100px; max-width: 300px; width: auto; height: auto; object-fit: contain;" /></div>` : ''}
          <div style="text-align: right; font-family: sans-serif;">
             <div style="background: ${brand.accent}; color: white; min-width: 170px; min-height: 44px; padding: 0 20px; border-radius: 12px; font-weight: 900; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; text-align: center; margin-bottom: 8px; text-transform: uppercase; box-sizing: border-box;">AFINAÇÃO: ${tuning}</div>
             <p style="font-weight: 900; font-size: 12px; color: #94a3b8; text-transform: uppercase; margin: 0; letter-spacing: 1px;">${new Date().toLocaleDateString()} • ${user || "GUITAR ARCHITECT AUTHOR"}</p>
          </div>
       </div>
    </div>
    <div class="diagram-placeholder" style="margin: 20px 0; min-height: 400px;"></div>
    ${notes ? `
      <div style="background: #ffffff; border: 3px solid #f1f5f9; padding: 40px; border-radius: 30px; margin-top: 20px;">
         <h3 style="font-family: sans-serif; font-weight: 900; font-size: 16px; color: ${brand.accent}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; border-bottom: 2px solid ${brand.accentSoft}; padding-bottom: 10px;">${t.notes}</h3>
         <p style="font-family: sans-serif; font-weight: 900; font-size: 20px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${notes}</p>
      </div>
    ` : ''}
  `;
  return card;
};

const drawPDFWatermark = (pdf: jsPDF) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(203, 213, 225); 
  const text = 'CRIADO COM GUITAR ARCHITECT — GUITARARCHITECT.COM.BR';
  const textWidth = pdf.getTextWidth(text);
  pdf.text(text, (pageWidth - textWidth) / 2, pageHeight - 10);
};

export const exportToPNG = async (lang: Lang, user: string, userLogo?: string, fallbackInstrument: InstrumentType = 'guitar-6') => {
  const { default: html2canvas } = await import('html2canvas');
  const containers = document.querySelectorAll('.diagram-container');
  if (containers.length === 0) return;
  const exportWrapper = createExportWrapper(lang);
  document.body.appendChild(exportWrapper);

  try {
    for (const container of Array.from(containers)) {
      const card = createDidacticCard(container, lang, user, userLogo, fallbackInstrument);
      
      const fretboardOnly = container.querySelector('svg');
      if (!fretboardOnly) continue;

      const svgCanvas = await html2canvas(fretboardOnly.parentElement as HTMLElement, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
      const img = new Image();
      img.src = svgCanvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.borderRadius = '25px';
      
      const placeholder = card.querySelector('.diagram-placeholder');
      if (placeholder) {
        placeholder.innerHTML = '';
        placeholder.appendChild(img);
      }
      
      exportWrapper.appendChild(card);
    }
    
    const watermark = document.createElement('div');
    watermark.style.textAlign = 'center';
    watermark.style.padding = '60px 0 20px 0';
    watermark.style.fontFamily = 'sans-serif';
    watermark.style.fontWeight = '900';
    watermark.style.fontSize = '18px';
    watermark.style.color = '#cbd5e1';
    watermark.style.textTransform = 'uppercase';
    watermark.style.letterSpacing = '8px';
    watermark.innerText = 'CRIADO COM GUITAR ARCHITECT — GUITARARCHITECT.COM.BR';
    exportWrapper.appendChild(watermark);

    const finalCanvas = await html2canvas(exportWrapper, { backgroundColor: '#ffffff', scale: 1.2 });
    const link = document.createElement('a');
    link.download = `GA_Diagramas_${new Date().getTime()}.png`;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
  } finally {
    document.body.removeChild(exportWrapper);
  }
};

export const exportToPDF = async (lang: Lang, user: string, userLogo?: string, fallbackInstrument: InstrumentType = 'guitar-6') => {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);

  const containers = document.querySelectorAll('.diagram-container');
  if (containers.length === 0) return;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  try {
    for (let i = 0; i < containers.length; i++) {
      const tempWrapper = createExportWrapper(lang);
      const card = createDidacticCard(containers[i], lang, user, userLogo, fallbackInstrument);
      
      const fretboardOnly = containers[i].querySelector('svg');
      if (!fretboardOnly) continue;

      const svgCanvas = await html2canvas(fretboardOnly.parentElement as HTMLElement, { 
        backgroundColor: '#ffffff', 
        scale: 2, 
        useCORS: true 
      });
      
      const img = new Image();
      img.src = svgCanvas.toDataURL('image/png');
      img.style.width = '100%';
      
      const placeholder = card.querySelector('.diagram-placeholder');
      if (placeholder) {
        placeholder.innerHTML = '';
        placeholder.appendChild(img);
      }

      tempWrapper.appendChild(card);
      document.body.appendChild(tempWrapper);

      const finalCanvas = await html2canvas(tempWrapper, { 
        backgroundColor: '#ffffff', 
        scale: 1.5 
      });
      
      const imgData = finalCanvas.toDataURL('image/png');
      const displayHeight = (finalCanvas.height * contentWidth) / finalCanvas.width;

      if (currentY + displayHeight > pageHeight - 20) {
        drawPDFWatermark(pdf);
        pdf.addPage();
        currentY = margin;
      }

      pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, displayHeight, undefined, 'FAST');
      currentY += displayHeight + 10; 
      
      document.body.removeChild(tempWrapper);
    }
    drawPDFWatermark(pdf);
    pdf.save(`GA_Metodo_${new Date().getTime()}.pdf`);
  } catch (e) { 
    console.error("Erro na exportação PDF:", e); 
  }
};
