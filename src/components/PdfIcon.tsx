export default function PdfIcon({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`relative inline-flex flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <path
          d="M5 2.5C5 1.67157 5.67157 1 6.5 1H14L19 6V21.5C19 22.3284 18.3284 23 17.5 23H6.5C5.67157 23 5 22.3284 5 21.5V2.5Z"
          fill="#FCA5A5"
        />
        <path d="M14 1L19 6H15C14.4477 6 14 5.55228 14 5V1Z" fill="#FECACA" />
      </svg>
      <span className="absolute inset-x-0 bottom-[18%] text-center text-[0.5rem] font-bold leading-none tracking-tight text-red-800">
        PDF
      </span>
    </span>
  );
}
