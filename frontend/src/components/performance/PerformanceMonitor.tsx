import React, { useEffect, useState } from 'react';
import {
  usePerformance,
  useMemoryMonitor,
  useNetworkStatus,
} from '../../hooks/usePerformance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showInProduction?: boolean;
}

/**
 * Performance monitoring component for development and debugging
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showInProduction = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>({});
  const memoryInfo = useMemoryMonitor();
  const { isOnline, connectionType } = useNetworkStatus();

  useEffect(() => {
    if (!enabled && !showInProduction) return;

    // Collect performance data
    const collectData = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      setPerformanceData({
        domContentLoaded:
          navigation?.domContentLoadedEventEnd -
          navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(
          (p) => p.name === 'first-contentful-paint'
        )?.startTime,
        resourceCount: performance.getEntriesByType('resource').length,
      });
    };

    collectData();
    const interval = setInterval(collectData, 5000);

    return () => clearInterval(interval);
  }, [enabled, showInProduction]);

  if (!enabled && !showInProduction) return null;

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleVisibility}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Performance panel */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '300px',
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9998,
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              marginBottom: '12px',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            Performance Monitor
          </div>

          {/* Network Status */}
          <div style={{ marginBottom: '8px' }}>
            <strong>Network:</strong> {isOnline ? '🟢 Online' : '🔴 Offline'}
            {connectionType !== 'unknown' && ` (${connectionType})`}
          </div>

          {/* Performance Metrics */}
          <div style={{ marginBottom: '8px' }}>
            <strong>Performance:</strong>
            <div>
              DOM Ready: {performanceData.domContentLoaded?.toFixed(2)}ms
            </div>
            <div>
              Load Complete: {performanceData.loadComplete?.toFixed(2)}ms
            </div>
            <div>First Paint: {performanceData.firstPaint?.toFixed(2)}ms</div>
            <div>FCP: {performanceData.firstContentfulPaint?.toFixed(2)}ms</div>
            <div>Resources: {performanceData.resourceCount}</div>
          </div>

          {/* Memory Info */}
          {memoryInfo && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Memory:</strong>
              <div>
                Used: {(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
              </div>
              <div>
                Total: {(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB
              </div>
              <div>
                Limit: {(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB
              </div>
            </div>
          )}

          {/* Core Web Vitals */}
          <WebVitalsMonitor />

          {/* Resource Timing */}
          <ResourceTimingMonitor />
        </div>
      )}
    </>
  );
};

/**
 * Core Web Vitals monitoring component
 */
const WebVitalsMonitor: React.FC = () => {
  const [vitals, setVitals] = useState<any>({});

  useEffect(() => {
    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setVitals((prev: any) => ({ ...prev, lcp: lastEntry.startTime }));
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        setVitals((prev: any) => ({
          ...prev,
          fid: (entry as any).processingStart - entry.startTime,
        }));
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          setVitals((prev: any) => ({ ...prev, cls: clsValue }));
        }
      });
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return (
    <div style={{ marginBottom: '8px' }}>
      <strong>Core Web Vitals:</strong>
      {vitals.lcp && <div>LCP: {vitals.lcp.toFixed(2)}ms</div>}
      {vitals.fid && <div>FID: {vitals.fid.toFixed(2)}ms</div>}
      {vitals.cls !== undefined && <div>CLS: {vitals.cls.toFixed(4)}</div>}
    </div>
  );
};

/**
 * Resource timing monitoring component
 */
const ResourceTimingMonitor: React.FC = () => {
  const [slowResources, setSlowResources] = useState<
    PerformanceResourceTiming[]
  >([]);

  useEffect(() => {
    const checkSlowResources = () => {
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      const slow = resources.filter((resource) => {
        const duration = resource.responseEnd - resource.requestStart;
        return duration > 1000; // Resources taking more than 1 second
      });

      setSlowResources(slow.slice(0, 5)); // Show top 5 slow resources
    };

    checkSlowResources();
    const interval = setInterval(checkSlowResources, 10000);

    return () => clearInterval(interval);
  }, []);

  if (slowResources.length === 0) return null;

  return (
    <div style={{ marginBottom: '8px' }}>
      <strong>Slow Resources:</strong>
      {slowResources.map((resource, index) => {
        const duration = resource.responseEnd - resource.requestStart;
        const name = resource.name.split('/').pop() || resource.name;
        return (
          <div key={index} style={{ fontSize: '10px' }}>
            {name}: {duration.toFixed(0)}ms
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceMonitor;


