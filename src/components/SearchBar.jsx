"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch, placeholder }) {
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    await onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8 sm:mb-16">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "nome, e-mail ou CPF, foto, descrição..."}
          className="w-full px-4 py-3 text-base sm:text-lg md:text-xl bg-card border border-border rounded-xl sm:rounded-2xl
                     focus:border-primary/60 focus:outline-none
                     placeholder-muted transition-all duration-200
                     shadow-lg sm:shadow-2xl"
        />

        <button
          type="submit"
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-4
                     hover:bg-border rounded-lg sm:rounded-xl transition-all duration-200
                     group-focus-within:bg-border"
        >
          <Search className="w-5 h-5 sm:w-7 sm:h-7 text-muted group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {/* Dica sutil quando o campo estiver vazio */}
      {!query && (
        <p className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-muted">
          Digite qualquer coisa • A IA entende português perfeitamente
        </p>
      )}
    </form>
  );
}
