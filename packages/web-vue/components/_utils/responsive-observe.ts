// https://github.com/ant-design/ant-design/blob/master/components/_util/responsiveObserve.ts

export type Breakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type SiderBreakpoint = 'xxxl' | Breakpoint;
export type BreakpointMap = Partial<Record<SiderBreakpoint, string>>;
export type ScreenMap = Partial<Record<SiderBreakpoint, boolean>>;

export const responsiveArray: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

export const responsiveMap: BreakpointMap = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
  xxxl: '(min-width: 1840px)',
};

type SubscribeFunc = (screens: ScreenMap, breakpointChecked: SiderBreakpoint) => void;

type MediaQueryResult = { matches: boolean };

type MediaQueryListener = (matches: MediaQueryResult) => void;

let subscribers: Array<{
  token: string;
  func: SubscribeFunc;
}> = [];
let subUid = -1;
let screens = {};

const responsiveObserve: {
  matchHandlers: {
    [key: string]: {
      mql: MediaQueryList;
      listener: MediaQueryListener;
    };
  };
  dispatch(pointMap: ScreenMap, breakpointChecked: SiderBreakpoint): boolean;
  subscribe(func: SubscribeFunc): string;
  unsubscribe(token: string): void;
  unregister(): void;
  register(): void;
} = {
  matchHandlers: {},
  dispatch(pointMap: ScreenMap, breakpointChecked: SiderBreakpoint) {
    screens = pointMap;
    if (subscribers.length < 1) {
      return false;
    }

    subscribers.forEach((item) => {
      item.func(screens, breakpointChecked);
    });

    return true;
  },
  subscribe(func: SubscribeFunc) {
    if (subscribers.length === 0) {
      this.register();
    }
    const token = (++subUid).toString();
    subscribers.push({
      token,
      func,
    });
    func(screens, null as unknown as SiderBreakpoint);
    return token;
  },
  unsubscribe(token: string) {
    subscribers = subscribers.filter((item) => item.token !== token);
    if (subscribers.length === 0) {
      this.unregister();
    }
  },
  unregister() {
    (Object.keys(responsiveMap) as SiderBreakpoint[]).forEach((screen: SiderBreakpoint) => {
      const matchMediaQuery = responsiveMap[screen];
      if (!matchMediaQuery) return;
      const handler = this.matchHandlers[matchMediaQuery];
      if (handler && handler.mql && handler.listener) {
        if (handler.mql.removeEventListener) {
          handler.mql.removeEventListener('change', handler.listener);
        } else {
          handler.mql.removeListener(handler.listener);
        }
      }
    });
  },
  register() {
    (Object.keys(responsiveMap) as SiderBreakpoint[]).forEach((screen: SiderBreakpoint) => {
      const matchMediaQuery = responsiveMap[screen];
      if (!matchMediaQuery) return;
      const listener = ({ matches }: MediaQueryResult) => {
        this.dispatch(
          {
            ...screens,
            [screen]: matches,
          },
          screen,
        );
      };
      const mql = window.matchMedia(matchMediaQuery);
      if (mql.addEventListener) {
        mql.addEventListener('change', listener);
      } else {
        mql.addListener(listener);
      }

      this.matchHandlers[matchMediaQuery] = {
        mql,
        listener,
      };

      listener(mql);
    });
  },
};

export default responsiveObserve;
