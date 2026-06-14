"use client";

export default function TrackedPdfLink({
  href,
  trackUrl,
  className,
  children,
}: {
  href: string;
  trackUrl: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        fetch(trackUrl, { method: "POST" }).catch(() => {});
      }}
    >
      {children}
    </a>
  );
}
