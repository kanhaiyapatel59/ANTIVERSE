import React from 'react';
import { IndianRupee, Building2, ShieldAlert, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function FinancialDamageCard({ 
  peopleCount = 14, 
  floodAreaPct = 82.5 
}) {
  // Financial loss calculation logic
  const propertyLossCrores = (floodAreaPct * 0.03).toFixed(2);
  const reliefBudgetLakhs = (peopleCount * 1.35).toFixed(2);
  const ndrfDeployLakhs = (peopleCount * 0.45).toFixed(2);
  const totalEconomicLossCrores = (parseFloat(propertyLossCrores) + (parseFloat(reliefBudgetLakhs) + parseFloat(ndrfDeployLakhs)) / 100).toFixed(2);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-slate-950/80 space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <IndianRupee className="w-4 h-4 text-amber-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Financial Damage Assessment & Relief Budget Allocator
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold">
          ESTIMATED LOSS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Infrastructure Loss */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">Infrastructure Damage</span>
          <strong className="text-base text-rose-400 font-bold">₹{propertyLossCrores} Crores</strong>
          <span className="text-[9px] text-slate-500 block">Submerged structures & roads</span>
        </div>

        {/* Relief Camp Provisioning */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">Relief Camp Budget</span>
          <strong className="text-base text-amber-300 font-bold">₹{reliefBudgetLakhs} Lakhs</strong>
          <span className="text-[9px] text-slate-500 block">Food, water, medicine, beds</span>
        </div>

        {/* Total Economic Impact */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1">
          <span className="text-[10px] text-amber-400 block uppercase">Total Economic Impact</span>
          <strong className="text-base text-amber-300 font-bold">₹{totalEconomicLossCrores} Crores</strong>
          <span className="text-[9px] text-amber-200/70 block">Government emergency fund allocation</span>
        </div>
      </div>
    </div>
  );
}
