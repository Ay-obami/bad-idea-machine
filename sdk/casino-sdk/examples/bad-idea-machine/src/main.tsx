import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/poppins/latin-700-italic.css';
import '@fontsource/poppins/latin-800.css';
import '@fontsource/poppins/latin-800-italic.css';
import '@fontsource/poppins/latin-900.css';
import '@fontsource/rubik/latin-400.css';
import '@fontsource/rubik/latin-500.css';

import { App } from './App';
import { GalleryScreen } from './gallery/GalleryScreen';
import { useCasinoHost } from './lib/useCasinoHost';
import { hasRecoverableRound, visibleView, type AppView } from './play/view-state';
import type { EnvironmentId } from './scene/types';
import './styles.css';

const ENVIRONMENT_STORAGE_KEY = 'bad-idea-machine:environment';

const KitchenLayeredStaticProof = lazy(async () => {
  const module = await import('./play/KitchenLayeredStaticProof');
  return { default: module.KitchenLayeredStaticProof };
});

const KitchenAftermathStaticProof = lazy(async () => {
  const module = await import('./play/KitchenAftermathStaticProof');
  return { default: module.KitchenAftermathStaticProof };
});

const KitchenTier1SeparationProof = lazy(async () => {
  const module = await import('./play/KitchenTier1SeparationProof');
  return { default: module.KitchenTier1SeparationProof };
});


type GalleryGateProps = Readonly<{
  onChoose: (environment: EnvironmentId) => void;
  onRecoverRound: () => void;
}>;

function GalleryGate({ onChoose, onRecoverRound }: GalleryGateProps) {
  const { snapshot } = useCasinoHost();
  const recoverableRound = snapshot
    ? hasRecoverableRound(snapshot.sessions.items, snapshot.integration.gameAddress)
    : false;
  const effectiveView = visibleView('gallery', recoverableRound);

  useEffect(() => {
    if (effectiveView === 'play') onRecoverRound();
  }, [effectiveView, onRecoverRound]);

  return <GalleryScreen onChoose={onChoose} />;
}

function ExperienceRoot() {
  const embedded = typeof window !== 'undefined' && window.self !== window.top;
  const [requestedView, setRequestedView] = useState<AppView>(embedded ? 'play' : 'gallery');

  const chooseEnvironment = (environment: EnvironmentId) => {
    try {
      window.localStorage.setItem(ENVIRONMENT_STORAGE_KEY, environment);
    } catch {
      // Environment persistence is cosmetic only.
    }
    setRequestedView('play');
  };

  if (requestedView === 'gallery') {
    return (
      <GalleryGate
        onChoose={chooseEnvironment}
        onRecoverRound={() => setRequestedView('play')}
      />
    );
  }

  return <App onBackToGallery={embedded ? undefined : () => setRequestedView('gallery')} />;
}


const scene = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('scene')
  : null;

function RootView() {
  if (scene === 'kitchen-layered-static') {
    return (
      <Suspense fallback={<main style={{ minHeight: '100vh', background: '#071014' }} />}>
        <KitchenLayeredStaticProof />
      </Suspense>
    );
  }

  if (scene === 'kitchen-aftermath-static') {
    return (
      <Suspense fallback={<main style={{ minHeight: '100vh', background: '#071014' }} />}>
        <KitchenAftermathStaticProof />
      </Suspense>
    );
  }

  if (scene === 'kitchen-tier1-separation') {
    return (
      <Suspense fallback={<main style={{ minHeight: '100vh', background: '#071014' }} />}>
        <KitchenTier1SeparationProof />
      </Suspense>
    );
  }

  return <ExperienceRoot />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootView />
  </StrictMode>,
);
