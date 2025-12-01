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
    <div className="bg-card/50 border border-border rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold">Popular Banco de Dados</h3>
      </div>
      <p className="text-sm text-muted mb-4">
        Adicione fotos de exemplo ao catálogo baseado em um termo. Útil para testes e demonstrações.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Ex: cachorros na praia, carros esportivos..."
          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !term.trim()}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
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
