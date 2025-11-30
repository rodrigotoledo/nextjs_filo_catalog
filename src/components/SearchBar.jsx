"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    console.log("Buscando por:", query);
    await onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-16">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="biquíni cinza, loira de lado, morena na praia, bunda grande..."
          className="w-full px-8 py-6 text-xl bg-card border border-border rounded-2xl
                     focus:border-primary/60 focus:outline-none
                     placeholder-muted transition-all duration-200
                     shadow-2xl"
        />

        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-4
                     hover:bg-border rounded-xl transition-all duration-200
                     group-focus-within:bg-border"
        >
          <Search className="w-7 h-7 text-muted group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {/* Dica sutil quando o campo estiver vazio */}
      {!query && (
        <p className="text-center mt-4 text-sm text-muted">
          Digite qualquer coisa • A IA entende português perfeitamente
        </p>
      )}
    </form>
  );
}
