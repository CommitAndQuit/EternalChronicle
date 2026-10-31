import React, { useRef, useState } from 'react';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { resolvePhoto } from '../../lib/images';

export default function MediaGrid({
  photos = [],
  editable = false,
  onRemove,
  onAdd,
  className = '',
}) {
  const [menuIndex, setMenuIndex] = useState(null);
  const inputRef = useRef(null);

  if (!photos.length && !editable) return null;

  if (editable) {
    return (
      <div className={className}>
        <div
          className={`grid gap-2 md:grid-cols-3 ${
            photos.length === 2 ? 'grid-cols-[1.45fr_1fr]' : 'grid-cols-2'
          }`}
        >
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="relative aspect-[0.77] overflow-hidden rounded-[18px] bg-[#F1EFEF]"
            >
              <img
                src={resolvePhoto(photo)}
                alt={`Journal photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />
              <button
                type="button"
                aria-label={`Photo ${index + 1} options`}
                aria-expanded={menuIndex === index}
                onClick={() => setMenuIndex(menuIndex === index ? null : index)}
                className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-[#29434B]/85 text-white backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <MoreHorizontal size={18} strokeWidth={2.6} />
              </button>
              {menuIndex === index && (
                <div className="absolute inset-0 z-20" onClick={() => setMenuIndex(null)}>
                  <div
                    className="absolute right-2 top-12 w-40 rounded-2xl border border-black/[0.06] bg-white p-1.5 shadow-[0_14px_30px_rgba(20,10,20,0.24)]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onRemove?.(index);
                        setMenuIndex(null);
                      }}
                      className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-[13.5px] font-medium text-[#C2185B] hover:bg-[#FCE8F0]"
                    >
                      <Trash2 size={16} strokeWidth={1.9} />
                      Remove photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            if (files.length) onAdd?.(files);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2.5 flex h-[58px] w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-black/15 bg-[#F7F5F5] text-[14px] font-medium text-[#6B666B] outline-none transition-colors hover:border-[#C2185B]/45 hover:text-[#C2185B] focus-visible:ring-2 focus-visible:ring-[#C2185B]"
        >
          <Plus size={18} strokeWidth={2} />
          Add photo
        </button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-2 md:grid-cols-3 ${className}`}>
      {photos.map((photo, index) => (
        <div
          key={`${photo}-${index}`}
          className="aspect-[0.77] overflow-hidden rounded-[18px] bg-[#F1EFEF]"
        >
          <img
            src={resolvePhoto(photo)}
            alt={`Journal photo ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
