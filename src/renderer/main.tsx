import React from 'react';
import ReactDOM from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { useAppStore } from './stores/appStore';
import { messages } from './i18n/messages';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function Root() {
  const locale = useAppStore((s) => s.locale);

  return (
    <React.StrictMode>
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="en">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </IntlProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
