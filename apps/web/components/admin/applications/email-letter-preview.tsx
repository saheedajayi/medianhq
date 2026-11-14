import { Fragment } from "react";
import type { AdminDecisionEmail } from "@/services/admin/applications";

/** Turns **bold** into <strong>, matching how the API renders the email */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
        index % 2 ? (
          <strong key={index} className="font-semibold text-[#101828]">
            {part}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}

/** The body of an email as the recipient reads it */
export function EmailLetterPreview({ email }: { email: AdminDecisionEmail }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-[#344054]">
      {email.blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={index}>
                <Inline text={block.text} />
              </p>
            );
          case "heading":
            return (
              <p key={index} className="font-semibold text-[#101828]">
                <Inline text={block.text} />
              </p>
            );
          case "quote":
            return (
              <p key={index} className="border-l-4 border-[#0284C7] pl-3 italic">
                <Inline text={block.text} />
              </p>
            );
          case "bullets":
            return (
              <ul key={index} className="list-disc space-y-1 pl-5">
                {block.items.map((item) => (
                  <li key={item}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            );
          case "numbered":
            return (
              <ol key={index} className="list-decimal space-y-1 pl-5">
                {block.items.map((item) => (
                  <li key={item.text}>
                    {item.title && (
                      <strong className="block font-semibold text-[#101828]">{item.title}</strong>
                    )}
                    <Inline text={item.text} />
                  </li>
                ))}
              </ol>
            );
          case "button":
            return (
              <span
                key={index}
                className="w-fit rounded-md bg-[#101828] px-4 py-2 text-sm font-semibold text-white"
              >
                {block.label}
              </span>
            );
        }
      })}
      <p>
        {email.signature.signOff && (
          <>
            {email.signature.signOff}
            <br />
          </>
        )}
        <strong className="font-semibold text-[#101828]">{email.signature.name}</strong>
        <br />
        <span className="text-xs text-[#667085]">{email.signature.title}</span>
      </p>
    </div>
  );
}
