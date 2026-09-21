"use client";

import { useEffect, useState } from "react";
import { LegalHeader } from "./legal-header";
import { LegalHero } from "./legal-hero";
import type { LegalDocument } from "./legal-data";

interface LegalPageLayoutProps {
  document: LegalDocument;
}

export function LegalPageLayout({ document }: LegalPageLayoutProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    document.sections[0]?.id ?? ""
  );

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = document.sections.map((sec) => ({
        id: sec.id,
        el: window.document.getElementById(sec.id),
      }));

      const scrollPosition = window.scrollY + 180;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i];
        if (item?.el) {
          const top = item.el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            setActiveSectionId(item.id);
            return;
          }
        }
      }

      if (sectionElements[0]?.id) {
        setActiveSectionId(sectionElements[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [document.sections]);

  const scrollToSection = (id: string) => {
    const el = window.document.getElementById(id);
    if (el) {
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSectionId(id);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#101828]">
      <LegalHeader />
      <LegalHero
        title={document.title}
        effectiveDate={document.effectiveDate}
      />

      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 border-b border-[#E5E7EB] bg-[#FFFAF5] p-6 sm:px-10 lg:w-[320px] lg:border-r lg:border-b-0 lg:py-12 lg:px-8 xl:w-[360px]">
          <div className="lg:sticky lg:top-[110px] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto">
            <nav aria-label="Sections" className="space-y-1">
              {document.sections.map((section) => {
                const isActive = activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left text-sm transition-all duration-150 px-3.5 py-2.5 rounded-lg cursor-pointer ${
                      isActive
                        ? "bg-[#FFEEE8] font-semibold text-[#FF5514]"
                        : "font-normal text-[#344054] hover:bg-black/[0.02] hover:text-[#101828]"
                    }`}
                  >
                    {section.number}. {section.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content Section */}
        <main className="flex-1 bg-white px-6 py-10 sm:px-12 sm:py-14 md:px-16 md:py-16 lg:px-20 lg:py-18">
          <div className="max-w-3xl space-y-10">
            {document.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-32"
              >
                <h2 className="text-lg font-bold tracking-tight text-[#4E0703] sm:text-xl">
                  {section.number}. {section.title}
                </h2>
                <p className="mt-3 text-sm leading-[1.75] text-[#344054] sm:text-[15px]">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
