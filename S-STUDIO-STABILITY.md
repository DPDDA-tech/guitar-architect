# S-STUDIO-STABILITY — Auditoria de Contratos e Isolamento

## Contexto
Documento resultante da auditoria técnica para estabilização do Studio antes da refatoração do módulo de Chords.

## 1. Inventário de Dependências
| Módulo | Dependência Crítica | Consumo de Fretboard |
| :--- | :--- | :--- |
| Chords | chordLibrary, AudioContext | Notas, Mute, Strumming |
| Scales | scaleEngine | Notas, Intervalos, Patterns |
| Practice | BpmEngine, IntentSystem | Animação, Highlighting |
| Triads | triadEngine | StringSets, Inversões |

## 2. Contratos Identificados (Riscos de Regressão)
- **Visual State:** `selectedNotes`, `markers`, `ghostNotes`.
- **Instrument State:** `tuning`, `stringsCount`, `fretCount`.
- **Interaction Intent:** `pendingFretboardAction` (Origem: Learn/Cycle).

## 3. Diagnóstico de Fragilidade
1. **Acoplamento SVG-Lógica:** O componente `FretboardSVG` possui conhecimento excessivo sobre o que está sendo renderizado.
2. **Vazamento de Estado:** Módulos de "Practice" podem deixar resíduos no estado global que afetam a visualização "Free".
3. **Dualidade de Tônica:** Conflito entre a tônica da Escala e a tônica do Acorde selecionado na UI.

## 4. Estratégia de Mitigação (Ordem Recomendada)
1. **Isolamento de Props:** Garantir que o Fretboard aceite uma interface limpa de `notesToRender` em vez de decidir o que renderizar.
2. **Schema Validation:** Validar o objeto `pendingFretboardAction` antes de processá-lo.
3. **Reset Automático:** Implementar um `hardReset` de visualização ao trocar de `activeEngine`.

## 5. Matriz de Risco para Correção de Chords
| Se alterar... | Pode quebrar... | Impacto |
| :--- | :--- | :--- |
| Estrutura do Acorde | Audio Playback | Crítico |
| Lógica de Mute/Open | Escalas / Triads | Médio |
| Filtro de Notas/Int. | Fretboard Labels | Alto |

---
*Auditoria realizada em Maio de 2026.*
*Guitar Architect Technical Board.*