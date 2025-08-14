"use client";

export function HeroActions() {
  return (
    <div className="flex flex-row gap-4 justify-center items-center">
      <button
        id="link"
        title="Docs link"
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Docs
      </button>
    </div>
  );
}
