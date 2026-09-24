import React from 'react';

// Global fallback for motion/react to eliminate useContext null errors
// that were happening on any button click (likely due to AnimatePresence exit + navigation race
// or motion's internal context being null during StrictMode double mount).

const stripMotionProps = (props: any) => {
  const {
    initial,
    animate,
    exit,
    transition,
    variants,
    whileTap,
    whileHover,
    whileInView,
    whileFocus,
    whileDrag,
    drag,
    dragConstraints,
    dragElastic,
    dragMomentum,
    onDrag,
    onDragStart,
    onDragEnd,
    custom,
    ...rest
  } = props;
  return rest;
};

const createMotionComponent = (tag: string) => {
  const Comp = React.forwardRef<any, any>((props, ref) => {
    const rest = stripMotionProps(props);
    return React.createElement(tag, { ...rest, ref }, props.children);
  });
  Comp.displayName = `motion.${tag}`;
  return Comp;
};

export const motion = new Proxy(
  {},
  {
    get: (_target, prop: string) => {
      if (typeof prop === 'string') {
        return createMotionComponent(prop);
      }
      return undefined;
    },
  }
) as any;

export const AnimatePresence: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({ children }) => {
  return <>{children}</>;
};

export const MotionConfig: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({ children }) => {
  return <>{children}</>;
};

export const LayoutGroup: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({ children }) => {
  return <>{children}</>;
};

export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
});

export const useMotionValue = (initial: any) => {
  const ref = React.useRef(initial);
  // Return a minimal MotionValue-like object with get/set
  return React.useMemo(
    () => ({
      get: () => ref.current,
      set: (v: any) => {
        ref.current = v;
      },
      // For compatibility with code that reads .current or calls as function
      get current() {
        return ref.current;
      },
      set current(v: any) {
        ref.current = v;
      },
    }),
    []
  );
};

export const useMotionTemplate = (...args: any[]) => {
  return args.join('');
};

export const useTransform = (value: any, transformer?: any) => {
  // If value is a MotionValue-like with get(), use its current value
  // If transformer is function, apply it
  const getVal = () => {
    const v = value && typeof value.get === 'function' ? value.get() : value;
    if (typeof transformer === 'function') {
      try {
        return transformer(v);
      } catch {
        return v;
      }
    }
    return v;
  };
  // Return a MotionValue-like that has get() and can be rendered as string
  return {
    get: getVal,
    toString: () => String(getVal()),
    valueOf: () => getVal(),
  } as any;
};
export const useScroll = () => ({ scrollY: { get: () => 0, scrollX: { get: () => 0 } } });
export const useSpring = (mv: any, _config?: any) => {
  // Return the same motion value, or a wrapper that has get()
  if (mv && typeof mv.get === 'function') return mv;
  return {
    get: () => (mv && typeof mv.get === 'function' ? mv.get() : mv),
    set: (v: any) => {
      if (mv && typeof mv.set === 'function') mv.set(v);
    },
  };
};
export const useInView = () => true;
export const useAnimationControls = useAnimation;
export const useMotionValueEvent = () => {};
export const useAnimationFrame = () => {};
export const useDragControls = () => ({
  start: () => {},
});

export const Reorder = {
  Group: ({ children }: any) => <>{children}</>,
  Item: ({ children }: any) => <>{children}</>,
};
