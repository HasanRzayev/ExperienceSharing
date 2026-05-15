import React from 'react';

const FooterPage = ({ icon, title, subtitle, content }) => {
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-8 sm:px-6 sm:pt-14 lg:px-8">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/70 dark:bg-slate-950/50 ring-1 ring-slate-200/70 dark:ring-white/10">
              <div className="text-3xl text-orange-600 dark:text-orange-400">{icon}</div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="gradient-text">{title}</span>
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-14 sm:px-6 lg:px-8">
        <div className="card-modern rounded-3xl p-6 sm:p-10">
          {content}
        </div>
      </div>
    </div>
  );
};

export default FooterPage;




