'use client';

export default function WelcomeBanner() {
  return (
    <div className="flex-shrink-0 bg-primary/5 border-b border-primary/10">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <p className="text-sm text-foreground/80 leading-relaxed">
          <span className="font-medium">This is a private space.</span>{' '}
          Nothing you share here is stored anywhere — there's no database,
          no account, no record. When you close this page, the conversation
          disappears completely.
        </p>
      </div>
    </div>
  );
}
