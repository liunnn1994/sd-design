import type { SVGProps } from 'react';

import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
export function SenderRecordingIcon(props: SVGProps<SVGSVGElement>) {
  const prefix = usePrefix('sender'),
    { t } = useI18n();
  return (
    <svg {...props} color="currentColor" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <title>{t('sender.recording')}</title>
      {[0, 1, 2, 3].map((index) => (
        <rect
          key={index}
          className={`${prefix}-recording-bar`}
          style={{ animationDelay: `${index * 0.2}s` }}
          fill="currentColor"
          rx="70"
          ry="70"
          height="250"
          width="140"
          x={index * 286.6667}
          y="375"
        />
      ))}
    </svg>
  );
}
export function SenderStopLoadingIcon(props: SVGProps<SVGSVGElement>) {
  const prefix = usePrefix('sender'),
    { t } = useI18n();
  return (
    <svg {...props} color="currentColor" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <title>{t('sender.stopGenerating')}</title>
      <rect fill="currentColor" height="250" rx="24" ry="24" width="250" x="375" y="375" />
      <circle
        cx="500"
        cy="500"
        fill="none"
        r="450"
        stroke="currentColor"
        strokeWidth="100"
        opacity=".45"
      />
      <circle
        className={`${prefix}-loading-spinner`}
        cx="500"
        cy="500"
        fill="none"
        r="450"
        stroke="currentColor"
        strokeWidth="100"
        strokeDasharray="600 9999999"
      />
    </svg>
  );
}
