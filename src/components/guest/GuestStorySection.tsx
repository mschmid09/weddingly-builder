interface StorySectionProps {
  storyTitle?: string;
  storyText?: string;
  storyImage1Url?: string;
  storyImage2Url?: string;
  primaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
}

export function GuestStorySection({
  storyTitle = 'Our Story',
  storyText,
  storyImage1Url,
  storyImage2Url,
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: StorySectionProps) {
  if (!storyText && !storyImage1Url && !storyImage2Url) return null;

  return (
    <section
      className="guest-section guest-story"
      style={{ fontFamily: bodyFont }}
    >
      <div className="guest-inner">
        <p className="guest-kicker">A little about us</p>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16"
          style={{
            fontFamily: headingFont,
            color: '#333',
          }}
        >
          {storyTitle}
        </h2>

        <div className="grid gap-8 sm:gap-12">
          {/* Story Text */}
          {storyText && (
            <div className="text-center max-w-2xl mx-auto">
              <p
                className="guest-story-text whitespace-pre-wrap"
                style={{ fontFamily: bodyFont }}
              >
                {storyText}
              </p>
            </div>
          )}

          {/* Images */}
          {(storyImage1Url || storyImage2Url) && (
            <div
              className={`grid gap-6 ${
                storyImage1Url && storyImage2Url
                  ? 'sm:grid-cols-2'
                  : 'sm:grid-cols-1'
              }`}
            >
              {storyImage1Url && (
                <div
                  className="guest-story-photo"
                >
                  <img
                    src={storyImage1Url}
                    alt="Our story"
                    loading="lazy"
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              )}
              {storyImage2Url && (
                <div
                  className="guest-story-photo"
                >
                  <img
                    src={storyImage2Url}
                    alt="Our story"
                    loading="lazy"
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
