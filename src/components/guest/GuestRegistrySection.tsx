interface RegistrySectionProps {
  registryTitle?: string;
  registryText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
}

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{part}</a>
      : part
  );
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
          style={{ fontFamily: headingFont }}
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
            {linkify(registryText)}
          </div>
        </div>
      </div>
    </section>
  );
}
