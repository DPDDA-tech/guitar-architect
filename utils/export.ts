
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

const createDidacticCard = (container: Element, lang: Lang, user: string, userLogo?: string) => {
  const t = translations[lang];
  const parent = container.closest('.diagram-container');
  
  const titleInput = parent?.querySelector('input[placeholder*="Título"]') as HTMLInputElement;
  const title = titleInput?.value || "";
  
  const subtitleInput = parent?.querySelector('input[placeholder*="Subtítulo"]') as HTMLInputElement;
  const subtitle = subtitleInput?.value || "";

  const notesTextarea = parent?.querySelector('textarea') as HTMLTextAreaElement;
  const notes = notesTextarea?.value || "";
  
  const selects = parent?.querySelectorAll('select');
  const root = (selects?.[0] as HTMLSelectElement)?.value || "C";
  const scaleNameInternal = (selects?.[1] as HTMLSelectElement)?.value || "Major (Ionian)";
  const tuning = (selects?.[3] as HTMLSelectElement)?.value || "Standard";
  
  const localizedScaleName = (t.scales && (t.scales as any)[scaleNameInternal]) || scaleNameInternal;
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
       <div style="display: flex; gap: 30px; align-items: flex-start; flex: 1;">
          <!-- APP BRANDING LOGO (Logo Oficial) -->
          <div style="width: 100px; height: 100px; display: flex; items-center; justify-center; overflow: hidden;">
             <img src="/logo.png" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(37,99,235,0.2));" />
          </div>
          <div style="flex: 1">
             <h1 style="font-family: sans-serif; font-weight: 900; font-style: italic; font-size: 50px; color: #0f172a; margin: 0; text-transform: uppercase; line-height: 0.9;">${root} ${localizedScaleName}</h1>
             <p style="font-family: sans-serif; font-weight: 900; font-size: 24px; color: #2563eb; margin-top: 10px; letter-spacing: 10px; opacity: 0.8;">${scaleDef?.formula || ""}</p>
             ${title ? `<p style="font-family: sans-serif; font-weight: 900; font-size: 22px; color: #1e293b; margin-top: 10px; text-transform: uppercase;">${title}</p>` : ''}
             ${subtitle ? `<p style="font-family: sans-serif; font-weight: bold; font-size: 14px; color: #64748b; margin-top: 5px; text-transform: uppercase;">${subtitle}</p>` : ''}
          </div>
       </div>
       <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 20px;">
          ${userLogo ? `<div style="height: 100px; width: 300px; display: flex; align-items: center; justify-content: flex-end;"><img src="${userLogo}" style="max-height: 100px; max-width: 300px; width: auto; height: auto; object-fit: contain;" /></div>` : ''}
          <div style="text-align: right; font-family: sans-serif;">
             <div style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 12px; font-weight: 900; font-size: 12px; display: inline-block; margin-bottom: 8px; text-transform: uppercase;">AFINAÇÃO: ${tuning}</div>
             <p style="font-weight: 900; font-size: 12px; color: #94a3b8; text-transform: uppercase; margin: 0; letter-spacing: 1px;">${new Date().toLocaleDateString()} • ${user || "GUITAR ARCHITECT AUTHOR"}</p>
          </div>
       </div>
    </div>
    <div class="diagram-placeholder" style="margin: 20px 0; min-height: 400px;"></div>
    ${notes ? `
      <div style="background: #ffffff; border: 3px solid #f1f5f9; padding: 40px; border-radius: 30px; margin-top: 20px;">
         <h3 style="font-family: sans-serif; font-weight: 900; font-size: 16px; color: #2563eb; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; border-bottom: 2px solid #eff6ff; padding-bottom: 10px;">${t.notes}</h3>
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

export const exportToPNG = async (lang: Lang, user: string, userLogo?: string) => {
  const containers = document.querySelectorAll('.diagram-container');
  if (containers.length === 0) return;
  const exportWrapper = createExportWrapper(lang);
  document.body.appendChild(exportWrapper);

  try {
    for (const container of Array.from(containers)) {
      const card = createDidacticCard(container, lang, user, userLogo);
      
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

export const exportToPDF = async (lang: Lang, user: string, userLogo?: string) => {
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
      const card = createDidacticCard(containers[i], lang, user, userLogo);
      
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
