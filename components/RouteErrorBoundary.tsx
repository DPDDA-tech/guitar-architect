import React from 'react';

type RouteErrorBoundaryProps = {
  children: React.ReactNode;
  fallbackPath?: string;
};

type RouteErrorBoundaryState = {
  error: Error | null;
};

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[RouteErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white md:p-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-900/70 bg-red-950/20 p-6">
          <p className="text-xs font-black uppercase tracking-widest text-red-300">Erro ao abrir esta página</p>
          <h1 className="mt-3 text-2xl font-black">A rota foi carregada, mas um componente falhou durante a renderização.</h1>
          <pre className="mt-5 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/40 p-4 text-xs leading-relaxed text-red-100">{this.state.error.message}\n\n{this.state.error.stack}</pre>
          <button
            type="button"
            onClick={() => navigateTo(this.props.fallbackPath ?? '/instructors')}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white"
          >
            Voltar à galeria
          </button>
        </div>
      </main>
    );
  }
}

export default RouteErrorBoundary;
