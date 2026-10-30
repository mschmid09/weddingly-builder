import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

interface GallerySectionProps {
  galleryTitle?: string;
  galleryImages?: string[];
  primaryColor?: string;
  headingFont?: string;
}

export function GuestGallerySection({
  galleryTitle = 'Our Gallery',
  galleryImages = [],
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
}: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    null,
  );

  if (!galleryImages || galleryImages.length === 0) return null;

  const getGridLayout = (count: number) => {
    // Smart layout based on image count
    if (count === 0) return 'grid-cols-1';
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2'; // 1 left, 2 right
    if (count === 4) return 'grid-cols-2';
    if (count === 5) return 'grid-cols-3'; // 2 left, 3 right
    if (count >= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  const getImageSpan = (index: number, total: number) => {
    // Special spanning for specific layouts
    if (total === 3 && index === 0) return 'row-span-2'; // First image spans 2 rows
    if (total === 5 && index < 2) return 'row-span-2'; // First 2 images span 2 rows
    return '';
  };

  return (
    <>
      <section
        className="guest-section guest-gallery"
      >
        <div className="guest-inner">
          <p className="guest-kicker">Collected moments</p>
          <h2 style={{ fontFamily: headingFont }}>{galleryTitle}</h2>

          <div
            className={`grid ${getGridLayout(
              galleryImages.length,
            )} auto-rows-[12rem] sm:auto-rows-[16rem] gap-3 sm:gap-4`}
          >
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                aria-label={`View photo ${index + 1}`}
                className={`guest-gallery-photo relative overflow-hidden cursor-pointer group ${getImageSpan(
                  index,
                  galleryImages.length,
                )}`}
              >
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={open => { if (!open) setSelectedImage(null); }}>
        <DialogContent className="guest-lightbox sm:max-w-5xl" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Wedding photograph</DialogTitle>
          {selectedImage && <img src={selectedImage} alt="Wedding photograph, full size" className="w-full max-h-[80dvh] object-contain" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
