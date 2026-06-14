export default function FolderIcon({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`relative inline-flex flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <path
          d="M2 5.5C2 4.67157 2.67157 4 3.5 4H9L11 6.5H20.5C21.3284 6.5 22 7.17157 22 8V18.5C22 19.3284 21.3284 20 20.5 20H3.5C2.67157 20 2 19.3284 2 18.5V5.5Z"
          fill="#FCD34D"
        />
        <path d="M2 8.5C2 7.67157 2.67157 7 3.5 7H20.5C21.3284 7 22 7.67157 22 8.5V18.5C22 19.3284 21.3284 20 20.5 20H3.5C2.67157 20 2 19.3284 2 18.5V8.5Z" fill="#FBBF24" />
      </svg>
    </span>
  );
}
