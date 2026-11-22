"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AddPayoutAccountModal } from "@/components/earnings/add-payout-account-modal";
import { maskAccount } from "@/components/earnings/earnings-utils";
import { usePayoutAccount } from "@/services/earnings/queries/earnings.queries";
import {
  useMySettings,
  useUpdateServiceCharge,
} from "@/services/settings/queries/settings.queries";
import {
  cardClass,
  cardTitleClass,
  Field,
  filledInputClass,
  FormSkeleton,
  getApiMessage,
  outlineButtonClass,
  TabError,
} from "../mentee/shared";

const FEE_OPTIONS = [
  {
    passFeeToMentee: false,
    title: "I absorb the fee",
    description: "Your payout is reduced by the platform fee. Mentees see your listed price.",
  },
  {
    passFeeToMentee: true,
    title: "Pass the fee to the mentee",
    description: "Mentees pay a bit more to cover the fee. You keep 100% of your listed price.",
  },
];

function ServiceChargeCard() {
  const { data, isLoading, isError, isFetching, refetch } = useMySettings();
  const updateServiceCharge = useUpdateServiceCharge();

  if (isLoading) return <FormSkeleton rows={2} label="Loading your service charge preference" />;
  if (isError || !data) return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  const passFeeToMentee = !!data.profile.mentorProfile?.passFeeToMentee;

  return (
    <section className={`${cardClass} flex flex-col gap-6`}>
      <div>
        <h2 className={cardTitleClass}>Service Charge Preference</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#475467]">
          Median retains a platform fee on every session, disclosed at onboarding. Choose who
          covers it by default. You can override this per session type later.
        </p>
      </div>

      <div role="radiogroup" aria-label="Who covers the platform fee" className="flex flex-col gap-6">
        {FEE_OPTIONS.map((option) => {
          const isSelected = option.passFeeToMentee === passFeeToMentee;
          return (
            <label key={option.title} className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="service-charge"
                checked={isSelected}
                disabled={updateServiceCharge.isPending}
                onChange={() =>
                  updateServiceCharge.mutate(option.passFeeToMentee, {
                    onSuccess: () => toast.success("Service charge preference saved"),
                    onError: (err) =>
                      toast.error(getApiMessage(err, "We couldn't save your preference.")),
                  })
                }
                className="mt-1 size-4 accent-[#FF5514]"
              />
              <span>
                <span className="block text-sm font-medium text-[#101828]">{option.title}</span>
                <span className="mt-0.5 block text-xs text-[#667085]">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function PayoutAccountDetailsCard() {
  const { data: account, isLoading, isError, isFetching, refetch } = usePayoutAccount();
  const [isChanging, setIsChanging] = useState(false);

  if (isLoading) return <FormSkeleton rows={3} label="Loading your payout account" />;
  if (isError) return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  const fields = [
    { id: "payout-bank", label: "Bank name", value: account?.bankName },
    {
      id: "payout-account-number",
      label: "Account number",
      value: account && maskAccount(account.accountLastFour),
    },
    { id: "payout-account-name", label: "Account name", value: account?.accountName },
  ];

  return (
    <section className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <h2 className={cardTitleClass}>Payout Account Details</h2>
        <p className="mt-1 text-sm text-[#475467]">
          {account
            ? "This is where your earnings are paid to."
            : "You haven't added a payout account yet. Add one to start receiving earnings."}
        </p>
      </div>

      {account &&
        fields.map((field) => (
          <Field key={field.id} id={field.id} label={field.label}>
            <input id={field.id} value={field.value ?? ""} disabled className={filledInputClass} />
          </Field>
        ))}

      <div className="flex justify-end">
        <button type="button" onClick={() => setIsChanging(true)} className={outlineButtonClass}>
          {account ? "Change payout account" : "Add payout account"}
        </button>
      </div>

      {isChanging && <AddPayoutAccountModal onClose={() => setIsChanging(false)} />}
    </section>
  );
}

export function PayoutsTab() {
  return (
    <div className="flex flex-col gap-6">
      <ServiceChargeCard />
      <PayoutAccountDetailsCard />
    </div>
  );
}
