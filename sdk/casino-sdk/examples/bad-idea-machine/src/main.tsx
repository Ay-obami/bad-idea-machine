import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/700-italic.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/800-italic.css';
import '@fontsource/poppins/900.css';
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/500.css';

import { App } from './App';
import { GalleryScreen } from './gallery/GalleryScreen';
import type { EnvironmentId } from './scene/types';
import './styles.css';

const ENVIRONMENT_STORAGE_KEY = 'bad-idea-machine:environment';

function ExperienceRoot() {
  const embedded = typeof window !== 'undefined' && window.self !== window.top;
  const [showGallery, setShowGallery] = useState(!embedded);

  const chooseEnvironment = (environment: EnvironmentId) => {
    try {
      window.localStorage.setItem(ENVIRONMENT_STORAGE_KEY, environment);
    } catch {
      // Environment persistence is cosmetic only.
    }
    setShowGallery(false);
  };

  return showGallery
    ? <GalleryScreen onChoose={chooseEnvironment} />
    : <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceRoot />
  </StrictMode>,
);
