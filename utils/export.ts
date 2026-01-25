
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Lang, translations } from '../i18n';

/**
 * Lógica de Exportação v3 (Orquestrada)
 * O FretboardPanel gerencia o estado 'isExporting', que oculta a UI 
 * e força o tema 'light' nos componentes. Esta utilidade apenas realiza 
 * a captura do elemento renderizado na tela.
 */

export const exportToPNG = async (lang: Lang) => {
  const t = translations[lang];
  const containers = document.querySelectorAll('.diagram-container');
  if (containers.length === 0) return;

  // Criar um wrapper temporário para agrupar as capturas se houver múltiplas
  // Isso evita que o exportCaptureArea seja visível durante o processo
  const exportWrapper = document.createElement('div');
  exportWrapper.style.padding = '40px';
  exportWrapper.style.background = '#ffffff';
  exportWrapper.style.display = 'flex';
  exportWrapper.style.flexDirection = 'column';
  exportWrapper.style.gap = '40px';
  exportWrapper.style.width = '1400px';
  exportWrapper.style.position = 'absolute';
  exportWrapper.style.left = '-9999px';
  document.body.appendChild(exportWrapper);

  try {
    for (const container of Array.from(containers)) {
      const canvas = await html2canvas(container as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.marginBottom = '20px';
      exportWrapper.appendChild(img);
    }

    const finalCanvas = await html2canvas(exportWrapper, { backgroundColor: '#ffffff', scale: 1 });
    const link = document.createElement('a');
    link.download = `GuitarArchitect_Export_${new Date().getTime()}.png`;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();

  } catch (error) {
    console.error("PNG Export Failed", error);
  } finally {
    document.body.removeChild(exportWrapper);
  }
};

export const exportToPDF = async (lang: Lang) => {
  const t = translations[lang];
  const containers = document.querySelectorAll('.diagram-container');
  if (containers.length === 0) return;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = 15;

  try {
    for (let i = 0; i < containers.length; i++) {
      const canvas = await html2canvas(containers[i] as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (currentY + imgHeight > pdf.internal.pageSize.getHeight() - 25) {
        pdf.addPage();
        currentY = 15;
      }

      pdf.addImage(imgData, 'PNG', 10, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 20;
    }

    pdf.save(`GuitarArchitect_Sheet_${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error("PDF Export Failed", error);
  }
};
