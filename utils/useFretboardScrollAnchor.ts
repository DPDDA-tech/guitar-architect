import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Mantém o wrapper de scroll horizontal do fretboard ancorado no início
 * visível (nut, ou o lado equivalente para canhotos) sempre que o container
 * muda de tamanho — por exemplo, ao girar o dispositivo entre portrait e
 * landscape. Sem isso, o scrollLeft herdado do layout anterior pode acabar
 * expondo um trecho diferente do braço (inclusive escondendo as primeiras
 * casas), já que o navegador não recalcula essa posição sozinho quando o
 * conteúdo é redimensionado — apenas a mantém (ou a satura no novo máximo).
 *
 * Usa ResizeObserver no próprio container (medição real, não
 * window.innerWidth) com fallback para resize/orientationchange em
 * ambientes sem suporte a ResizeObserver.
 */
export function useFretboardScrollAnchor(
  scrollRef: RefObject<HTMLDivElement | null>,
  isLeftHanded: boolean,
): void {
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const anchor = () => {
      node.scrollLeft = isLeftHanded ? node.scrollWidth : 0;
    };

    anchor();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', anchor);
      window.addEventListener('orientationchange', anchor);
      return () => {
        window.removeEventListener('resize', anchor);
        window.removeEventListener('orientationchange', anchor);
      };
    }

    const observer = new ResizeObserver(anchor);
    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollRef, isLeftHanded]);
}
