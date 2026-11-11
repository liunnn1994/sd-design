import { usePrefix } from '../config-provider/index.js';

export function EyeIcon({ invisible = false }: { invisible?: boolean }) {
  const prefix = usePrefix('icon');
  return (
    <svg
      className={`${prefix} ${prefix}-${invisible ? 'eye-invisible' : 'eye'}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      {invisible ? (
        <>
          <path d="M14 14.5c-2.69 2-5.415 5.33-8 9.5q8.06 13 18 13 4.987 0 9.5-3.271M17.464 12.5C19 11 21.749 11 24 11q9.94 0 18 13-2.649 4.272-5.5 7.14" />
          <path d="M29 24a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM6.852 7.103l34.294 34.294" />
        </>
      ) : (
        <>
          <path d="M24 37q9.94 0 18-13-8.06-13-18-13T6 24q8.06 13 18 13Z" />
          <path d="M29 24a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z" />
        </>
      )}
    </svg>
  );
}
