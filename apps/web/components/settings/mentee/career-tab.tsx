"use client";

import { useState } from "react";
import { Edit2 } from "iconsax-react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import { CreatableMultiSelect } from "@/components/ui/custom/creatable-multi-select";
import {
  MAX_MENTOR_PROFILE_ITEMS,
  MENTOR_SKILL_SUGGESTIONS,
  MENTOR_TOOL_SUGGESTIONS,
} from "@/constants/mentor-profile";
import type { CareerDates, Education, WorkExperience } from "@/services/settings";
import {
  useCareerInfo,
  useDeleteEducation,
  useDeleteExperience,
  useSaveEducation,
  useSaveExperience,
} from "@/services/settings/queries/settings.queries";
import {
  cardClass,
  cardTitleClass,
  Field,
  FormSkeleton,
  getApiMessage,
  inputClass,
  neutralButtonClass,
  outlineButtonClass,
  selectTriggerClass,
  TabError,
  textareaClass,
} from "./shared";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const INDUSTRIES = ["Finance", "Technology", "Business", "Consulting"];
const YEARS = Array.from({ length: 60 }, (_, index) => new Date().getFullYear() - index);

const formatRange = (entry: CareerDates) => {
  const start = `${MONTHS[entry.startMonth - 1]} ${entry.startYear}`;
  const end =
    entry.isCurrent || !entry.endMonth ? "Present" : `${MONTHS[entry.endMonth - 1]} ${entry.endYear}`;
  return `${start} - ${end}`;
};

function EntryCard({
  title,
  organisation,
  entry,
  description,
  onEdit,
}: {
  title: string;
  organisation: string;
  entry: CareerDates;
  description?: string | null;
  onEdit: () => void;
}) {
  return (
    <article className="relative rounded-2xl border border-[#EAECF0] p-4">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${title}`}
        className="absolute right-4 top-4 rounded p-1 hover:bg-[#F2F4F7]"
      >
        <Edit2 size="18" variant="Outline" color="#475467" />
      </button>
      <h3 className="pr-8 text-base text-[#101828]">
        {title} <span className="ml-1 text-[#475467]">@ {organisation}</span>
      </h3>
      <p className="mt-1 text-xs text-[#667085]">{formatRange(entry)}</p>
      {description && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#475467]">
          {description}
        </p>
      )}
      <ul className="mt-3 flex flex-wrap gap-2">
        {[...entry.skills, ...entry.tools].map((tag) => (
          <li key={tag} className="rounded-full bg-[#F7F8FB] px-3 py-1 text-xs text-[#475467]">
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}

function MonthYearSelect({
  month,
  year,
  disabled,
  onMonthChange,
  onYearChange,
}: {
  month: string;
  year: string;
  disabled?: boolean;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}) {
  return (
    <>
      <Select value={month} onValueChange={onMonthChange} disabled={disabled}>
        <SelectTrigger className={selectTriggerClass}>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((name, index) => (
            <SelectItem key={name} value={String(index + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={onYearChange} disabled={disabled}>
        <SelectTrigger className={selectTriggerClass}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((value) => (
            <SelectItem key={value} value={String(value)}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

type FormConfig = {
  idPrefix: string;
  titleLabel: string;
  titlePlaceholder: string;
  organisationLabel: string;
  organisationPlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  saveLabel: string;
  showIndustry: boolean;
};

type FormValues = {
  title: string;
  organisation: string;
  industry?: string | null;
  description?: string | null;
} & Partial<CareerDates>;

function CareerEntryForm({
  config,
  initial,
  canCancel,
  isSaving,
  onCancel,
  onSave,
  onDelete,
}: {
  config: FormConfig;
  initial?: FormValues;
  canCancel: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (values: { title: string; organisation: string; industry: string | null; description: string | null } & CareerDates) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [organisation, setOrganisation] = useState(initial?.organisation ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [startMonth, setStartMonth] = useState(initial?.startMonth ? String(initial.startMonth) : "");
  const [startYear, setStartYear] = useState(initial?.startYear ? String(initial.startYear) : "");
  const [endMonth, setEndMonth] = useState(initial?.endMonth ? String(initial.endMonth) : "");
  const [endYear, setEndYear] = useState(initial?.endYear ? String(initial.endYear) : "");
  const [isCurrent, setIsCurrent] = useState(initial?.isCurrent ?? false);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [tools, setTools] = useState<string[]>(initial?.tools ?? []);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      !title.trim() && config.titleLabel,
      !organisation.trim() && config.organisationLabel,
      (!startMonth || !startYear) && "Start date",
      !isCurrent && (!endMonth || !endYear) && "End date",
      skills.length === 0 && "Skills",
      tools.length === 0 && "Tools",
    ].filter(Boolean);
    if (missing.length > 0) {
      setError(`Please add: ${missing.join(", ")}.`);
      return;
    }

    setError("");
    try {
      await onSave({
        title,
        organisation,
        industry: industry || null,
        description: description.trim() || null,
        startMonth: Number(startMonth),
        startYear: Number(startYear),
        endMonth: isCurrent ? null : Number(endMonth),
        endYear: isCurrent ? null : Number(endYear),
        isCurrent,
        skills,
        tools,
      });
    } catch (err) {
      setError(getApiMessage(err, "We couldn't save this. Please try again."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field id={`${config.idPrefix}-title`} label={config.titleLabel}>
        <input
          id={`${config.idPrefix}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={config.titlePlaceholder}
          className={inputClass}
        />
      </Field>
      <Field id={`${config.idPrefix}-organisation`} label={config.organisationLabel}>
        <input
          id={`${config.idPrefix}-organisation`}
          value={organisation}
          onChange={(e) => setOrganisation(e.target.value)}
          placeholder={config.organisationPlaceholder}
          className={inputClass}
        />
      </Field>
      {config.showIndustry && (
        <Field label="Industry">
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      <Field label="Start date">
        <div className="grid grid-cols-2 gap-3">
          <MonthYearSelect
            month={startMonth}
            year={startYear}
            onMonthChange={setStartMonth}
            onYearChange={setStartYear}
          />
        </div>
      </Field>
      <Field label="End date">
        <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <MonthYearSelect
            month={isCurrent ? "" : endMonth}
            year={isCurrent ? "" : endYear}
            disabled={isCurrent}
            onMonthChange={setEndMonth}
            onYearChange={setEndYear}
          />
          <label className="flex items-center gap-2 text-sm text-[#101828]">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="size-4 accent-[#FF5514]"
            />
            Present
          </label>
        </div>
      </Field>
      <Field id={`${config.idPrefix}-description`} label={config.descriptionLabel}>
        <textarea
          id={`${config.idPrefix}-description`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={config.descriptionPlaceholder}
          className={textareaClass}
        />
      </Field>
      <CreatableMultiSelect
        id={`${config.idPrefix}-skills`}
        label="Skills"
        required
        values={skills}
        onChange={setSkills}
        options={MENTOR_SKILL_SUGGESTIONS}
        maxItems={MAX_MENTOR_PROFILE_ITEMS}
      />
      <CreatableMultiSelect
        id={`${config.idPrefix}-tools`}
        label="Tools"
        required
        values={tools}
        onChange={setTools}
        options={MENTOR_TOOL_SUGGESTIONS}
        maxItems={MAX_MENTOR_PROFILE_ITEMS}
      />

      {error && (
        <p role="alert" className="text-sm font-medium text-[#D92D20]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {canCancel && (
            <button type="button" disabled={isSaving} onClick={onCancel} className={neutralButtonClass}>
              Cancel
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                onDelete().catch((err) =>
                  setError(getApiMessage(err, "We couldn't delete this. Please try again."))
                )
              }
              className="px-2 text-sm font-medium text-[#D92D20] hover:underline disabled:opacity-60"
            >
              Delete
            </button>
          )}
        </div>
        <button type="submit" disabled={isSaving} className={outlineButtonClass}>
          {isSaving ? "Saving..." : config.saveLabel}
        </button>
      </div>
    </form>
  );
}

function AddButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 self-start px-1 text-sm font-medium text-[#FF5514] disabled:text-[#98A2B3]"
    >
      <Plus className="size-4" />
      {label}
    </button>
  );
}

/** A list of saved entries with one add or edit form open at a time */
function CareerSection<T extends { id: string }>({
  heading,
  addLabel,
  config,
  entries,
  toCard,
  toFormValues,
  isSaving,
  save,
  remove,
  savedMessage,
}: {
  heading: string;
  addLabel: string;
  config: FormConfig;
  entries: T[];
  toCard: (entry: T) => { title: string; organisation: string; description?: string | null } & CareerDates;
  toFormValues: (entry: T) => FormValues;
  isSaving: boolean;
  save: (values: Parameters<React.ComponentProps<typeof CareerEntryForm>["onSave"]>[0], id?: string) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  savedMessage: string;
}) {
  // "new", an entry's ID, or nothing open. With no entries yet, the form is the whole card.
  const [openForm, setOpenForm] = useState<string | null>(null);
  const showNewForm = openForm === "new" || entries.length === 0;

  const handleSave = async (values: Parameters<typeof save>[0], id?: string) => {
    await save(values, id);
    toast.success(savedMessage);
    setOpenForm(null);
  };

  return (
    <section className={`${cardClass} flex flex-col gap-4`}>
      <h2 className={cardTitleClass}>{heading}</h2>

      {entries.map((entry) =>
        openForm === entry.id ? (
          <CareerEntryForm
            key={entry.id}
            config={config}
            initial={toFormValues(entry)}
            canCancel
            isSaving={isSaving}
            onCancel={() => setOpenForm(null)}
            onSave={(values) => handleSave(values, entry.id)}
            onDelete={async () => {
              await remove(entry.id);
              toast.success("Deleted");
              setOpenForm(null);
            }}
          />
        ) : (
          <EntryCard
            key={entry.id}
            {...toCard(entry)}
            entry={toCard(entry)}
            onEdit={() => setOpenForm(entry.id)}
          />
        )
      )}

      {showNewForm && (
        <CareerEntryForm
          config={config}
          canCancel={entries.length > 0}
          isSaving={isSaving}
          onCancel={() => setOpenForm(null)}
          onSave={(values) => handleSave(values)}
        />
      )}

      {entries.length > 0 && (
        <AddButton label={addLabel} disabled={openForm !== null} onClick={() => setOpenForm("new")} />
      )}
    </section>
  );
}

const EXPERIENCE_FORM: FormConfig = {
  idPrefix: "experience",
  titleLabel: "Current role",
  titlePlaceholder: "Data Analyst",
  organisationLabel: "Company",
  organisationPlaceholder: "Company name",
  descriptionLabel: "Your contribution",
  descriptionPlaceholder: "What did you work on?",
  saveLabel: "Save experience",
  showIndustry: true,
};

const EDUCATION_FORM: FormConfig = {
  idPrefix: "education",
  titleLabel: "Field of study",
  titlePlaceholder: "Product Management",
  organisationLabel: "School",
  organisationPlaceholder: "School name",
  descriptionLabel: "What did you learn",
  descriptionPlaceholder: "What did you learn?",
  saveLabel: "Save education",
  showIndustry: false,
};

export function CareerTab() {
  const { data, isLoading, isError, isFetching, refetch } = useCareerInfo();
  const saveExperience = useSaveExperience();
  const deleteExperience = useDeleteExperience();
  const saveEducation = useSaveEducation();
  const deleteEducation = useDeleteEducation();

  if (isLoading) return <FormSkeleton rows={5} label="Loading your career info" />;
  if (isError || !data) return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  return (
    <div className="flex flex-col gap-6">
      <CareerSection<WorkExperience>
        heading="Work experience"
        addLabel="Add work experience"
        config={EXPERIENCE_FORM}
        entries={data.experiences}
        toCard={(entry) => ({
          ...entry,
          title: entry.role,
          organisation: entry.company,
          description: entry.contribution,
        })}
        toFormValues={(entry) => ({
          ...entry,
          title: entry.role,
          organisation: entry.company,
          description: entry.contribution,
        })}
        isSaving={saveExperience.isPending || deleteExperience.isPending}
        save={({ title, organisation, description, ...rest }, id) =>
          saveExperience.mutateAsync({
            ...rest,
            id,
            role: title,
            company: organisation,
            contribution: description,
          })
        }
        remove={(id) => deleteExperience.mutateAsync(id)}
        savedMessage="Work experience saved"
      />

      <CareerSection<Education>
        heading="Education"
        addLabel="Add education"
        config={EDUCATION_FORM}
        entries={data.educations}
        toCard={(entry) => ({
          ...entry,
          title: entry.fieldOfStudy,
          organisation: entry.school,
          description: entry.learnings,
        })}
        toFormValues={(entry) => ({
          ...entry,
          title: entry.fieldOfStudy,
          organisation: entry.school,
          description: entry.learnings,
        })}
        isSaving={saveEducation.isPending || deleteEducation.isPending}
        save={({ title, organisation, description, industry: _industry, ...rest }, id) =>
          saveEducation.mutateAsync({
            ...rest,
            id,
            fieldOfStudy: title,
            school: organisation,
            learnings: description,
          })
        }
        remove={(id) => deleteEducation.mutateAsync(id)}
        savedMessage="Education saved"
      />
    </div>
  );
}
