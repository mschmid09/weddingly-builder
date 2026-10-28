interface RegistrySectionProps {
  registryTitle?: string;
  registryText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
}

export function GuestRegistrySection({
  registryTitle = 'Gift Registry',
  registryText,
  primaryColor = '#e4b6c6',
  secondaryColor = '#d4a5a5',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: RegistrySectionProps) {
  if (!registryText) return null;

  return (
    <section
      className="guest-section guest-registry"
      style={{
        fontFamily: bodyFont,
      }}
    >
      <div className="max-w-3xl mx-auto">
        <p className="guest-kicker">With gratitude</p>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16"
          style={{
            fontFamily: headingFont,
            color: '#333',
          }}
        >
          {registryTitle}
        </h2>

        <div
          className="guest-registry-note"
        >
          <div
            className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-wrap"
            style={{ fontFamily: bodyFont }}
          >
            {registryText}
          </div>
        </div>
      </div>
    </section>
  );
}
