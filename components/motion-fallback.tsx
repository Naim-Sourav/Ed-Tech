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
  return ref.current;
};

export const useMotionTemplate = (...args: any[]) => {
  return args.join('');
};

export const useTransform = () => 0;
export const useScroll = () => ({ scrollY: { get: () => 0, scrollX: { get: () => 0 } } });
export const useSpring = (v: any) => v;
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
