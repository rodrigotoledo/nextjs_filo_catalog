import { Tooltip } from 'react-tooltip';

export default function PhotoGrid({ photos = [] }) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24 md:py-32">
        <div className="max-w-md mx-auto space-y-3 sm:space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto bg-border/50 rounded-xl sm:rounded-2xl animate-pulse" />
          <p className="text-lg sm:text-xl md:text-2xl font-medium text-muted">
            Nenhuma foto ainda
          </p>
          <p className="text-xs sm:text-sm text-muted/70">
            Faça upload das suas imagens e a IA vai processar tudo automaticamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2 md:gap-4 mt-4 sm:mt-8 md:mt-12">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card/50 shadow-lg transition-all hover:shadow-2xl hover:border-primary/30"
          data-tip={photo.justification || 'Sem justificativa'}
        >
          <img
            src={photo.url}
            alt={photo.justification || 'Foto do catálogo'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay sutil ao passar o mouse */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-xs text-white/80 truncate">
                {photo.id?.toString().slice(0, 8) || 'Sem ID'}
              </p>
              {photo.similarity_score && (
                <p className="text-xs text-white/60">
                  Score: {(photo.similarity_score * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <Tooltip />
    </div>
  );
}
