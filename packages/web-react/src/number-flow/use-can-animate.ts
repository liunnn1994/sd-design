import { observeNumberFlowMotion } from '@sdata/web-core/number-flow/motion';
import { useEffect, useState } from 'react';

export function useCanAnimate({
  respectMotionPreference = true,
}: { respectMotionPreference?: boolean } = {}) {
  const [motion, setMotion] = useState({ mounted: false, reduced: false });
  useEffect(
    () =>
      observeNumberFlowMotion(window.matchMedia('(prefers-reduced-motion: reduce)'), (reduced) =>
        setMotion({ mounted: true, reduced }),
      ),
    [],
  );
  return motion.mounted && (!respectMotionPreference || !motion.reduced);
}
