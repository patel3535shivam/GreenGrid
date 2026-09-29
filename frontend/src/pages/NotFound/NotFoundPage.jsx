import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          404 - Page Not Found
        </h1>
        <p className="text-slate-500 mt-1">The requested resource could not be located.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Resource Unavailable</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <a 
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
