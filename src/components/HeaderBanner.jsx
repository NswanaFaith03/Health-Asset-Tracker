import React from 'react'

export default function HeaderBanner({ title, subtitle, icon: Icon }) {
    return (
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-40 bg-gradient-to-r from-red-50 via-white via-orange-50 to-emerald-50 md:h-32 lg:h-28 backdrop-blur-[2px]">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#d91f26] via-[#f59e0b] to-[#1f8a4c]" />

                <div className="relative z-10 flex h-full items-center gap-4 p-6 md:p-8">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 shadow-sm md:h-12 md:w-12">
                        {Icon ? <Icon className="h-7 w-7 text-red-700 md:h-6 md:w-6" /> : null}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-3xl font-bold leading-tight text-slate-900 md:text-2xl lg:text-2xl">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 truncate text-sm text-slate-600 md:text-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
