import { usePrefix } from '../config-provider/index.js';

export function ImageCloseIcon() {
  const prefix = usePrefix('icon');
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      viewBox="0 0 48 48"
      className={`${prefix} ${prefix}-image-close`}
      aria-hidden="true"
    >
      <path d="M41 26V9a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v30a2 2 0 0 0 2 2h17" />
      <path d="m24 33 9-8.5V27s-2 1-3.5 2.5C27.841 31.159 27 33 27 33zm0 0-3.5-4.5L17 33z" />
      <path
        fill="currentColor"
        stroke="none"
        d="M20.5 28.5 17 33h7zM33 24.5 24 33h3s.841-1.841 2.5-3.5C31 28 33 27 33 27z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        stroke="none"
        d="M46 38a8 8 0 1 1-16 0 8 8 0 0 1 16 0m-4.95-4.782 1.74 1.74-3.045 3.046 3.046 3.046-1.74 1.74-3.047-3.045-3.046 3.046-1.74-1.74 3.046-3.047-3.046-3.046 1.74-1.74 3.046 3.046z"
        clipRule="evenodd"
      />
      <path d="M17 15h-2v2h2z" />
    </svg>
  );
}
