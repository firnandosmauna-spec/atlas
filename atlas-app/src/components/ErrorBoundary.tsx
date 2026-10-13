import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Terjadi Kesalahan pada Aplikasi</h2>
            <p className="text-sm text-gray-600 mb-4 text-left bg-gray-50 p-3 rounded border border-gray-200 text-xs font-mono break-words">
              {this.state.error?.message || 'Aplikasi mengalami kesalahan yang tidak terduga.'}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-atlas-blue hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Muat Ulang Halaman
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch {}
                  window.location.href = '/login';
                }}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
              >
                Reset Sesi & Masuk Kembali
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
