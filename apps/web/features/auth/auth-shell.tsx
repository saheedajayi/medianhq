import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedAuthCopy } from "./animated-auth-copy";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid h-svh min-h-0 overflow-hidden bg-white text-[#141c2e] lg:grid-cols-[40%_60%]">
      <aside className="relative hidden h-svh min-h-0 overflow-hidden bg-[#FF5514] px-10 py-14 text-white lg:flex lg:flex-col xl:px-20 xl:pt-[120px] xl:pb-20">
        <Link href="/" aria-label="Median home" className="relative z-10 w-fit">
          <Image
            src="/auth/Median logo.svg"
            alt="Median"
            width={224}
            height={45}
            priority
            className="h-auto w-[190px] xl:w-[224px]"
          />
        </Link>

        <Image
          src="/auth/bottom-left-bg.svg"
          alt=""
          width={564}
          height={386}
          className="pointer-events-none absolute bottom-0 left-[6.6%] z-0 h-auto w-[93.4%] max-w-none select-none opacity-[0.15]"
        />

        <AnimatedAuthCopy />
      </aside>

      <section className="relative h-svh min-h-0 overflow-hidden bg-[#FFFAF5]">
        <Image
          src="/auth/bottom-right-bg.svg"
          alt=""
          width={324}
          height={318}
          className="pointer-events-none absolute right-0 bottom-0 h-auto w-[280px] select-none xl:w-[324px]"
        />

        <div className="relative z-10 h-full overflow-y-auto overscroll-contain">
          <div className="flex min-h-full items-center justify-center px-5 py-10 sm:px-10">
            <div className="w-full max-w-[552px]">
              <div className="rounded-3xl bg-white p-6 sm:p-8">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
