import { useState, useEffect } from 'react';
import styles from './HydratationDemo.module.css';

const BLOCKS = [
  { id: 'header', label: 'Header' },
  { id: 'hero', label: 'Contenido principal' },
  { id: 'card1', label: 'Sección' },
  { id: 'card2', label: 'Sección' },
  { id: 'footer', label: 'Footer' },
];

const ISLAND_ID = 'card2';

const ACTS = [
  {
    id: 'spa',
    label: 'React SPA',
    message: 'La página no puede mostrarse hasta que todo el JavaScript esté listo.',
  },
  {
    id: 'astro',
    label: 'Astro',
    message: 'El contenido estático es visible de manera inmediata. Solo lo que necesita JavaScript espera. Esto es exactamente lo que hace esta sección de demostración en esta página.',
  },
  {
    id: 'conclusion',
    label: null,
    message: null,
  },
];

export default function HydrationDemo() {
  const [actIndex, setActIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | loading | done
  const [litBlocks, setLitBlocks] = useState([]);

  const act = ACTS[actIndex];

  useEffect(() => {
    if (phase !== 'loading') return;

    let timeouts = [];

    if (act.id === 'spa') {
      timeouts.push(setTimeout(() => {
        setLitBlocks(BLOCKS.map(b => b.id));
        setPhase('done');
      }, 2800));
    }

    if (act.id === 'astro') {
      const staticBlocks = BLOCKS.filter(b => b.id !== ISLAND_ID).map(b => b.id);
      setLitBlocks(staticBlocks);

      timeouts.push(setTimeout(() => {
        setLitBlocks(BLOCKS.map(b => b.id));
        setPhase('done');
      }, 2200));
    }

    return () => timeouts.forEach(clearTimeout);
  }, [phase, act.id]);

  function handleAction() {
    if (act.id === 'conclusion') {
      setActIndex(0);
      setPhase('idle');
      setLitBlocks([]);
      return;
    }

    if (phase === 'idle') {
      setPhase('loading');
      return;
    }

    if (phase === 'done') {
      const next = actIndex + 1;
      setActIndex(next);
      setPhase(ACTS[next].id === 'conclusion' ? 'done' : 'idle');
      setLitBlocks([]);
    }
  }

  function getButtonLabel() {
    if (act.id === 'conclusion') return 'Empezar de nuevo';
    if (phase === 'idle') return 'Cargar página';
    if (phase === 'loading') return '...';
    return 'Siguiente';
  }

  function getBlockState(blockId) {
    if (litBlocks.includes(blockId)) return 'lit';
    if (phase === 'loading') return 'loading';
    return 'idle';
  }

  function getIslandLabel(blockId) {
    if (act.id !== 'astro' || blockId !== ISLAND_ID) return null;
    const state = getBlockState(blockId);
    if (state === 'loading') return 'Esta sección necesita JavaScript para funcionar.';
    if (state === 'lit') return '⚡ Isla React — activa';
    return null;
  }

  return (
    <div className={styles.wrapper}>

      {/* Cabecera: label + mensaje + botón */}
      <div className={styles.stageTop}>
        <div className={styles.stageText}>
          <span className={styles.stageLabel}>
            {act.id !== 'conclusion' ? act.label : '\u00a0'}
          </span>
          <p className={styles.stageMessage}>
            {act.id === 'conclusion'
              ? '\u00a0'
              : phase === 'idle'
              ? 'Pulsa el botón para simular la carga de la página.'
              : act.message}
          </p>
        </div>
        {act.id !== 'conclusion' && (
          <button
            className={styles.button}
            onClick={handleAction}
            disabled={phase === 'loading'}
          >
            {getButtonLabel()}
          </button>
        )}
      </div>

      {/* Área principal — altura fija, alterna entre diagrama y conclusión */}
      <div className={styles.mainArea}>
        {act.id !== 'conclusion' ? (
          <div className={styles.stageDiagram}>
            <div className={styles.page}>
              <div className={styles.windowBar}>
                <span className={styles.windowTitle}>Navegador</span>
                <div className={styles.windowButtons}>
                  <span className={styles.windowBtn}>─</span>
                  <span className={styles.windowBtn}>□</span>
                  <span className={`${styles.windowBtn} ${styles.windowBtnClose}`}>✕</span>
                </div>
              </div>
              <div className={styles.windowContent}>
                {BLOCKS.map(block => {
                  const state = getBlockState(block.id);
                  const isIsland = act.id === 'astro' && block.id === ISLAND_ID;

                  return (
                    <div
                      key={block.id}
                      className={[
                        styles.block,
                        state === 'lit' ? styles.blockLit : '',
                        isIsland && state === 'lit' ? styles.blockIsland : '',
                      ].join(' ')}
                    >
                      <span className={styles.blockLabel}>{block.label}</span>
                      {state === 'loading' && !(act.id === 'astro' && block.id !== ISLAND_ID) && <span className={styles.spinner} />}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className={styles.islandNote}>
              {act.id === 'astro' ? (getIslandLabel(ISLAND_ID) || '\u00a0') : '\u00a0'}
            </p>
          </div>
        ) : (
          <div className={styles.conclusion}>
            <p className={styles.conclusionText}>Astro no elimina JavaScript.</p>
            <p className={styles.conclusionSub}>Decide dónde es necesario.</p>
            <button className={styles.button} onClick={handleAction}>
              {getButtonLabel()}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}