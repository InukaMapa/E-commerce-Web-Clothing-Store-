import React from "react";

const StatCard = ({ label, value, trend, icon: Icon, color = "black" }) => {
  return (
    <div className="bg-white p-8 border border-black/5 hover:border-black/20 transition-all group">
      <div className="flex items-center justify-between mb-8">
        <span className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 group-hover:text-black transition-colors">
          {label}
        </span>
        <div
          className={`p-3 bg-gray-50 group-hover:bg-black group-hover:text-white transition-all`}
        >
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-serif font-bold text-black tracking-tight mb-2">
            {value}
          </p>
          {trend && (
            <p
              className={`text-xs font-bold uppercase tracking-widest ${trend > 0 ? "text-green-500" : "text-red-500"}`}
            >
              {trend > 0 ? "+" : ""}
              {trend}% VS LAST MONTH
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
