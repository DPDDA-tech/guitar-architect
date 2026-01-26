
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Lang, translations } from '../i18n';
import { SCALES } from '../music/scales';

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

const createDidacticCard = (container: Element, lang: Lang, user: string) => {
  const t = translations[lang];
  const parent = container.closest('div[class*="rounded-[40px]"]');
  const title = (parent?.querySelector('input:nth-of-type(1)') as HTMLInputElement)?.value || "";
  const scaleNameInternal = (parent?.querySelector('select:nth-of-type(2)') as HTMLSelectElement)?.value || "Major (Ionian)";
  const root = (parent?.querySelector('select:nth-of-type(1)') as HTMLSelectElement)?.value || "C";
  const tuning = (parent?.querySelector('select:nth-of-type(3)') as HTMLSelectElement)?.value || "Standard";
  
  const localizedScaleName = (t.scales && t.scales[scaleNameInternal as keyof typeof t.scales]) || scaleNameInternal;
  const scaleDef = SCALES.find(s => s.name === scaleNameInternal);

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
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 6px solid #2563eb; padding-bottom: 40px;">
       <div style="flex: 1">
          <h1 style="font-family: sans-serif; font-weight: 900; font-style: italic; font-size: 60px; color: #0f172a; margin: 0; text-transform: uppercase;">${root} ${localizedScaleName}</h1>
          <p style="font-family: sans-serif; font-weight: 900; font-size: 26px; color: #2563eb; margin-top: 15px; letter-spacing: 12px;">${scaleDef?.formula || ""}</p>
          ${title ? `<p style="font-family: sans-serif; font-weight: bold; font-size: 18px; color: #94a3b8; margin-top: 10px; text-transform: uppercase;">${title}</p>` : ''}
       </div>
       <div style="text-align: right; font-family: sans-serif;">
          <div style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 12px; font-weight: 900; font-size: 14px; display: inline-block; margin-bottom: 15px; text-transform: uppercase;">${t.tuning}: ${tuning}</div>
          <p style="font-weight: 900; font-size: 12px; color: #cbd5e1; text-transform: uppercase; margin: 0;">${new Date().toLocaleDateString()} • ${user || (lang === 'pt' ? "AUTOR GA" : "GA AUTHOR")}</p>
       </div>
    </div>
  `;
  return card;
};

const addWatermarkHTML = (wrapper: HTMLElement) => {
  const watermark = document.createElement('div');
  watermark.style.textAlign = 'center';
  watermark.style.padding = '60px 0 20px 0';
  watermark.style.fontFamily = 'sans-serif';
  watermark.style.fontWeight = '900';
  watermark.style.fontSize = '16px';
  watermark.style.color = '#cbd5e1';
  watermark.style.textTransform = 'uppercase';
  watermark.style.letterSpacing = '8px';
  watermark.innerText = 'CRIADO COM GUITAR ARCHITECT — GUITARARCHITECT.COM.BR';
  wrapper.appendChild(watermark);
};

const drawPDFWatermark = (pdf: jsPDF) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(203, 213, 225); 
  const text = 'CRIADO COM GUITAR ARCHITECT — GUITARARCHITECT.COM.BR';
  const textWidth = pdf.getTextWidth(text);
  pdf.text(text, (pageWidth - textWidth) / 2, pageHeight - 10);
};

export const exportToPNG = async (lang: Lang, user: string) => {
  const containers = document.querySelectorAll('.diagram-container');
  if (containers.length === 0) return;
  const exportWrapper = createExportWrapper(lang);
  document.body.appendChild(exportWrapper);

  try {
    for (const container of Array.from(containers)) {
      const card = createDidacticCard(container, lang, user);
      const svgCanvas = await html2canvas(container as HTMLElement, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
      const img = new Image();
      img.src = svgCanvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.borderRadius = '25px';
      card.appendChild(img);
      exportWrapper.appendChild(card);
    }
    addWatermarkHTML(exportWrapper);
    const finalCanvas = await html2canvas(exportWrapper, { backgroundColor: '#ffffff', scale: 1 });
    const link = document.createElement('a');
    link.download = `GA_Diagramas_${new Date().getTime()}.png`;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
  } finally {
    document.body.removeChild(exportWrapper);
  }
};

export const exportToPDF = async (lang: Lang, user: string) => {
  const containers = document.querySelectorAll('.diagram-container');
  if (containers.length === 0) return;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  drawPDFWatermark(pdf);

  try {
    for (let i = 0; i < containers.length; i++) {
      const tempWrapper = createExportWrapper(lang);
      const card = createDidacticCard(containers[i], lang, user);
      
      const svgCanvas = await html2canvas(containers[i] as HTMLElement, { 
        backgroundColor: '#ffffff', 
        scale: 2, 
        useCORS: true 
      });
      
      const img = new Image();
      img.src = svgCanvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.borderRadius = '25px';
      card.appendChild(img);
      tempWrapper.appendChild(card);
      document.body.appendChild(tempWrapper);

      const finalCanvas = await html2canvas(tempWrapper, { 
        backgroundColor: '#ffffff', 
        scale: 1.5 
      });
      
      const imgData = finalCanvas.toDataURL('image/png');
      const displayHeight = (finalCanvas.height * contentWidth) / finalCanvas.width;

      if (currentY + displayHeight > pageHeight - 20) {
        pdf.addPage();
        drawPDFWatermark(pdf);
        currentY = margin;
      }

      pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, displayHeight, undefined, 'FAST');
      currentY += displayHeight + 8; 
      
      document.body.removeChild(tempWrapper);
    }
    pdf.save(`GA_Metodo_${new Date().getTime()}.pdf`);
  } catch (e) { 
    console.error("Erro crítico na exportação PDF:", e); 
  }
};
