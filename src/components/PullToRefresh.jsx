import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef(null);
  const refreshThreshold = 80;

  const handleTouchStart = (e) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  const refreshOpacity = Math.min(pullDistance / refreshThreshold, 1);
  const rotation = (pullDistance / refreshThreshold) * 360;

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-white border-b border-gray-200"
          style={{
            height: `${Math.min(pullDistance, refreshThreshold)}px`,
            opacity: refreshOpacity,
            transform: `translateY(${Math.max(0, pullDistance - refreshThreshold)}px)`
          }}
        >
          <RefreshCw
            size={24}
            className={`text-blue-500 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${rotation}deg)`
            }}
          />
          <span className="ml-2 text-sm text-gray-600">
            {isRefreshing ? 'Refreshing...' : pullDistance >= refreshThreshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance, refreshThreshold)}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
