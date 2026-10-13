import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Award, Users, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
          Our Agricultural Mission
        </span>
        <h1 className="text-4xl font-black text-stone-900 tracking-tight">
          Connecting Soil & Soul Without Intermediaries
        </h1>
        <p className="text-base text-stone-600 leading-relaxed">
          Farm2Door was engineered to solve one of agriculture's oldest systemic problems: the exploitation of hardworking farmers by layered middlemen, while consumers pay inflated prices for stale produce.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Fair Farmgate Price</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            By connecting consumers directly with producers, farmers receive up to 60% higher realization per harvest, revitalizing rural family livelihoods.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Zero Synthetic Ripeners</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every fruit and vegetable on Farm2Door is naturally tree or vine ripened without calcium carbide or artificial chemicals.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Full Provenance Transparency</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            No anonymous warehouse batches. Each item profile displays the farmer's name, farm location, acreage, and authentic buyer reviews.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
