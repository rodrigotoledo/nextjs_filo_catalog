"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function SeedForm({ onPopulate }) {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!term.trim()) return;

    setLoading(true);
    try {
      await onPopulate(term);
      setTerm("");
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <h3 className="text-sm sm:text-base md:text-lg font-semibold">Popular Banco de Dados</h3>
      </div>
      <p className="text-xs sm:text-sm text-muted mb-3 sm:mb-4">
        Adicione fotos de exemplo ao catálogo baseado em um termo.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Ex: cachorros na praia..."
          className="flex-1 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !term.trim()}
          className="px-4 py-2 sm:px-6 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Populando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Popular
            </>
          )}
        </button>
      </form>
    </div>
  );
}
