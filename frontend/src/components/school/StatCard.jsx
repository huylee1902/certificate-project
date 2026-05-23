import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, colorClass, bgClass }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full group cursor-default"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-xl ${bgClass} ${colorClass} group-hover:rotate-6 transition-transform duration-300`}>
          <Icon size={26} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-sm font-semibold text-slate-500 mt-1">{title}</p>
      </div>
    </motion.div>
  );
}