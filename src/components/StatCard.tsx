/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { StatMetric, Language } from '../types';
import { DynamicIcon } from './Icons';

interface StatCardProps {
  metric: StatMetric;
  language: Language;
  key?: string;
}

export default function StatCard({ metric, language }: StatCardProps) {
  const isHi = language === 'hi';
  const label = isHi ? metric.labelHi : metric.labelEn;
  const value = isHi ? metric.valueHi : metric.valueEn;
  const subtext = isHi ? metric.subtextHi : metric.subtextEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between h-52 transition-shadow hover:shadow-2xl"
    >
      {/* Decorative gradient corner */}
      <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full bg-gradient-to-br ${metric.colorClass} opacity-10 blur-xl`} />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </span>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${metric.colorClass} text-white shadow-md`}>
            <DynamicIcon name={metric.iconName} size={20} />
          </div>
        </div>

        <h3 className="text-3xl font-extrabold text-gray-900 mt-6 tracking-tight font-display">
          {value}
        </h3>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <p className="text-xs text-gray-500 font-medium">
          {subtext}
        </p>
      </div>
    </motion.div>
  );
}
