import { RootProvider } from '@/components/RootProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import pkg from '../../package.json';
import Content from './Content.tsx';

const container = document.createElement('div');
container.id = pkg.name;
document.body.appendChild(container);

createRoot(container).render(
  <StrictMode>
    <RootProvider>
      <Content />
    </RootProvider>
  </StrictMode>,
);
