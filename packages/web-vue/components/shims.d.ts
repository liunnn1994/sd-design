declare module 'b-tween' {
  interface TweenOptions<Values extends Record<string, number>> {
    from: Values;
    to: Values;
    // Defaults to 500 when omitted, matching the runtime implementation.
    duration?: number;
    delay?: number;
    easing?: string;
    onStart?: (values: Values) => void;
    onUpdate?: (values: Values) => void;
    onFinish?: (values: Values) => void;
  }
  export default class BTween<Values extends Record<string, number> = Record<string, number>> {
    constructor(options: TweenOptions<Values>);
    start(): void;
    stop(): void;
  }
}
