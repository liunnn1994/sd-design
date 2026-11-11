import { usePrefix } from '../config-provider/index.js';

export function LoadingIcon({ spin = false }: { spin?: boolean }) {
  const prefix = usePrefix('icon');
  return (
    <svg
      className={`${prefix} ${prefix}-loading${spin ? ` ${prefix}-spin` : ''}`}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      aria-hidden="true"
    >
      <path d="M42 24c0 9.941-8.059 18-18 18S6 33.941 6 24 14.059 6 24 6" />
    </svg>
  );
}
