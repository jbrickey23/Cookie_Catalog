import React from 'react';
import {createRoot} from 'react-dom/client';
import {ReleaseNotice} from './ReleaseNotice';
import {App} from './App';
createRoot(document.getElementById('root')!).render(<React.StrictMode><ReleaseNotice><App /></ReleaseNotice></React.StrictMode>);
