# 🎲 DOCUMENTO DE REQUERIMIENTOS TÉCNICOS  
## Proyecto: Generala Online – Etapa 2 (Motor de Juego)

---

# 1. OBJETIVO DE ESTA ETAPA

Desarrollar la lógica completa del juego (Game Engine) y la experiencia interactiva del usuario dentro de `/play/game`, incorporando:

- Motor de dados
- Sistema de turnos
- Hoja de puntuación dinámica
- Validación de combinaciones
- CPU básica (fase inicial)
- Finalización de partida
- Persistencia local
- Animaciones y feedback visual

Esta etapa transforma el MVP visual en un juego funcional.

---

# 2. ARQUITECTURA TÉCNICA BASE

## Stack actual

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Zustand o Context API (estado global)
- PWA habilitada
- Deploy en Vercel

---

# 3. ESTRUCTURA FUNCIONAL DEL JUEGO

## 3.1 Flujo General

1. Usuario configura partida en `/play`
2. Se navega a `/play/game`
3. Se inicializa estado de partida
4. Se desarrollan turnos alternados (Jugador vs CPU)
5. Se completan categorías
6. Se calcula ganador
7. Pantalla de resultados

---

# 4. REQUERIMIENTOS FUNCIONALES

---

# 4.1 MOTOR DE DADOS

## Requisitos

- 5 dados virtuales
- Cada dado debe tener:
  - Valor (1–6)
  - Estado (bloqueado / libre)
- Máximo 3 tiradas por turno
- Animación de roll (300–600ms)
- Sonido opcional (fase futura)

## Lógica

- Primera tirada: lanza los 5 dados
- Segunda y tercera: solo los no bloqueados
- Después de la tercera tirada → obligatorio seleccionar categoría

---

# 4.2 SISTEMA DE TURNOS

## Requisitos

- Alternancia automática:
  - Jugador
  - CPU
- Indicador visual de turno activo
- Reset automático de:
  - Dados
  - Tiradas
  - Locks

---

# 4.3 HOJA DE PUNTUACIÓN

## Sección Superior

- 1
- 2
- 3
- 4
- 5
- 6

## Sección Inferior

- Escalera menor (si está activada)
- Escalera mayor
- Full
- Poker
- Generala
- Doble Generala (si está activada)
- Chance

## Variantes

- Bonus 63
- +5 puntos por servido
- Activación/desactivación desde setup

---

# 4.4 VALIDACIÓN DE COMBINACIONES

El sistema debe:

- Detectar automáticamente combinaciones posibles
- Mostrar previsualización de puntaje al hacer hover
- Bloquear categorías ya utilizadas
- Confirmar selección
- Forzar selección si no quedan tiradas

---

# 4.5 CPU (FASE INICIAL SIMPLE)

## Nivel Easy

- Tira 3 veces
- Selecciona mejor combinación disponible sin estrategia avanzada

## Nivel Medium

- Prioriza:
  - Full
  - Poker
  - Generala
  - Escaleras
- Optimiza elección de locks

## Nivel Hard (fase futura)

- Evaluación probabilística
- Simulación de escenarios

---

# 4.6 CÁLCULO DE RESULTADOS

- Suma automática por sección
- Aplicación automática de bonus
- Comparación final
- Pantalla de ganador
- Botón "Revancha"
- Opción "Nueva partida"

---

# 5. ESTADO GLOBAL DEL JUEGO

Se recomienda utilizar un store global (Zustand).

## Estructura sugerida:

```ts
gameState:
- currentTurn
- dice[]
- rollsLeft
- lockedDice[]
- playerScorecard
- cpuScorecard
- gamePhase
- winner
- variants
```

---

# 6. COMPONENTES A DESARROLLAR

## GameLayout
Contenedor general del juego

## DiceTray
Visualización y animación de dados

## Dice
Componente individual de dado

## ScoreBoard
Tabla interactiva de puntuación

## TurnIndicator
Indicador de turno activo

## RollButton
Botón de tirada

## GameOverModal
Pantalla final con resultados

---

# 7. UX / UI REQUERIMIENTOS

- Animación fluida de dados
- Feedback visual cuando una categoría es seleccionable
- Transición suave entre turnos
- Indicador claro de tiradas restantes
- Bloqueo visual de categorías usadas
- Responsive obligatorio en landscape
- Diseño consistente con estética casino minimalista actual

---

# 8. PERSISTENCIA

## MVP

- LocalStorage:
  - Última partida
  - Configuración seleccionada

## Fase futura

- Base de datos
- Ranking online
- Usuario autenticado
- Historial de partidas

---

# 9. ESTRUCTURA DE CARPETAS PROPUESTA

```
/app/play/game
/components/game
  Dice.tsx
  DiceTray.tsx
  ScoreBoard.tsx
  TurnIndicator.tsx
  GameOverModal.tsx
/lib/game
  diceEngine.ts
  scoreCalculator.ts
  cpuLogic.ts
/store
  gameStore.ts
```

---

# 10. TESTING

- Validación de combinaciones
- Validación de bonus
- Test de alternancia de turnos
- Test de finalización correcta
- Validación de persistencia

---

# 11. PERFORMANCE

- Separar lógica pura de UI
- Evitar re-render innecesarios
- Memoización de cálculos pesados
- Animaciones optimizadas
- Estado controlado correctamente

---

# 12. ROADMAP POST-ETAPA

## Fase 3

- Multiplayer online
- Sistema de ranking
- Logros
- Avatar personalizable
- Modo torneo
- Partidas privadas con link

---

# RESULTADO ESPERADO

Al finalizar esta etapa, Generala Online debe ser:

- 100% jugable
- Con lógica completa
- Con CPU funcional
- Con hoja de puntuación dinámica
- Con experiencia fluida tipo casino digital
- Estable y escalable para futuras expansiones
