import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import './VirtualList.css';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ComponentType;
  emptyComponent?: React.ComponentType;
  errorComponent?: React.ComponentType;
  error?: string;
}

/**
 * Virtual scrolling component for large lists with performance optimization
 */
const VirtualList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  loading = false,
  loadingComponent: LoadingComponent,
  emptyComponent: EmptyComponent,
  errorComponent: ErrorComponent,
  error,
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  // Scroll to specific item
  const scrollToItem = useCallback(
    (index: number) => {
      if (containerRef.current) {
        const scrollTop = index * itemHeight;
        containerRef.current.scrollTop = scrollTop;
        setScrollTop(scrollTop);
      }
    },
    [itemHeight]
  );

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollToItem(0);
  }, [scrollToItem]);

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Offset for visible items
  const offsetY = visibleRange.start * itemHeight;

  // Default components
  const DefaultLoading = () => (
    <div className="virtual-list-loading">
      <div className="loading-spinner">
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
      <div>Loading items...</div>
    </div>
  );

  const DefaultEmpty = () => (
    <div className="virtual-list-empty">
      <div className="empty-icon">📭</div>
      <div>No items to display</div>
    </div>
  );

  const DefaultError = () => (
    <div className="virtual-list-error">
      <div className="error-icon">❌</div>
      <div>Error loading items</div>
      <div className="error-message">{error}</div>
    </div>
  );

  // Render loading state
  if (loading) {
    const LoadingToRender = LoadingComponent || DefaultLoading;
    return (
      <div
        className={`virtual-list ${className}`}
        style={{ height: containerHeight }}
      >
        <LoadingToRender />
      </div>
    );
  }

  // Render error state
  if (error) {
    const ErrorToRender = ErrorComponent || DefaultError;
    return (
      <div
        className={`virtual-list ${className}`}
        style={{ height: containerHeight }}
      >
        <ErrorToRender />
      </div>
    );
  }

  // Render empty state
  if (items.length === 0) {
    const EmptyToRender = EmptyComponent || DefaultEmpty;
    return (
      <div
        className={`virtual-list ${className}`}
        style={{ height: containerHeight }}
      >
        <EmptyToRender />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="list"
      aria-label={`List with ${items.length} items`}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            return (
              <div
                key={actualIndex}
                className="virtual-list-item"
                style={{
                  height: itemHeight,
                  position: 'relative',
                }}
                role="listitem"
                aria-setsize={items.length}
                aria-posinset={actualIndex + 1}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div
          className="scroll-thumb"
          style={{
            height: `${(containerHeight / totalHeight) * 100}%`,
            top: `${(scrollTop / totalHeight) * 100}%`,
          }}
        />
      </div>

      {/* Scroll to top button */}
      {scrollTop > containerHeight && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <span role="img" aria-hidden="true">
            ⬆️
          </span>
        </button>
      )}
    </div>
  );
};

// Hook for virtual list with search and filtering
export const useVirtualList = <T,>(
  allItems: T[],
  searchTerm: string = '',
  filterFn?: (item: T, searchTerm: string) => boolean
) => {
  const filteredItems = useMemo(() => {
    if (!searchTerm && !filterFn) return allItems;

    return allItems.filter((item) => {
      if (filterFn) {
        return filterFn(item, searchTerm);
      }

      // Default string search
      const itemString = JSON.stringify(item).toLowerCase();
      return itemString.includes(searchTerm.toLowerCase());
    });
  }, [allItems, searchTerm, filterFn]);

  return {
    items: filteredItems,
    totalCount: allItems.length,
    filteredCount: filteredItems.length,
    hasFilter: searchTerm.length > 0 || !!filterFn,
  };
};

export default VirtualList;


