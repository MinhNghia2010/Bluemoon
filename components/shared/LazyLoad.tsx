'use client'

import { useState, useEffect, useRef, ReactNode, ComponentType } from 'react';
import dynamic from 'next/dynamic';

interface LazyLoadProps {
  children: ReactNode;
  skeleton: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

// Basic LazyLoad wrapper using IntersectionObserver
export function LazyLoad({ 
  children, 
  skeleton, 
  rootMargin = '100px', 
  threshold = 0.1 
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref}>
      {hasLoaded ? children : skeleton}
    </div>
  );
}

// Higher-order function to create a lazy-loaded component with viewport detection
export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ [key: string]: ComponentType<T> }>,
  exportName: string,
  Skeleton: ComponentType
) {
  const LazyComponent = dynamic(
    () => importFn().then(mod => ({ default: mod[exportName] as ComponentType<T> })),
    { loading: () => <Skeleton />, ssr: false }
  );

  return function ViewportLazyComponent(props: T) {
    const [isInViewport, setIsInViewport] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = ref.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px', threshold: 0.01 }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref}>
        {isInViewport ? <LazyComponent {...props} /> : <Skeleton />}
      </div>
    );
  };
}

// Lazy load items in a list - only renders items when they're near viewport
interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  skeleton: ReactNode;
  className?: string;
  rootMargin?: string;
}

export function LazyList<T>({ 
  items, 
  renderItem, 
  skeleton, 
  className = '',
  rootMargin = '100px' 
}: LazyListProps<T>) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <LazyListItem 
          key={index} 
          skeleton={skeleton}
          rootMargin={rootMargin}
        >
          {renderItem(item, index)}
        </LazyListItem>
      ))}
    </div>
  );
}

function LazyListItem({ 
  children, 
  skeleton,
  rootMargin 
}: { 
  children: ReactNode; 
  skeleton: ReactNode;
  rootMargin: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : skeleton}
    </div>
  );
}
