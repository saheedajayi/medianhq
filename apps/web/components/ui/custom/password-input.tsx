import * as React from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/base/input";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/base/popover";
import { cn } from "@/lib/utils";

export interface PasswordCriterion {
  id: string;
  label: string;
  isMet: boolean;
}

export function evaluatePasswordCriteria(password: string): {
  criteria: PasswordCriterion[];
  metCount: number;
  totalCount: number;
  strengthLabel: string;
  strengthColor: string;
} {
  const pwd = password || "";
  const criteria: PasswordCriterion[] = [
    {
      id: "min-length",
      label: "At least 8 characters",
      isMet: pwd.length >= 8,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter (A-Z)",
      isMet: /[A-Z]/.test(pwd),
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter (a-z)",
      isMet: /[a-z]/.test(pwd),
    },
    {
      id: "number",
      label: "At least one number (0-9)",
      isMet: /[0-9]/.test(pwd),
    },
    {
      id: "special",
      label: "At least one special character (!@#$%...)",
      isMet: /[^A-Za-z0-9]/.test(pwd),
    },
  ];

  const metCount = criteria.filter((c) => c.isMet).length;
  const totalCount = criteria.length;

  let strengthLabel = "Weak";
  let strengthColor = "bg-rose-500";

  if (metCount === 5) {
    strengthLabel = "Strong";
    strengthColor = "bg-emerald-500";
  } else if (metCount >= 3) {
    strengthLabel = "Fair";
    strengthColor = "bg-amber-500";
  } else if (metCount >= 1) {
    strengthLabel = "Weak";
    strengthColor = "bg-rose-400";
  } else {
    strengthLabel = "Empty";
    strengthColor = "bg-slate-200";
  }

  return { criteria, metCount, totalCount, strengthLabel, strengthColor };
}

export interface PasswordInputProps extends InputProps {
  showCriteriaTooltip?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showCriteriaTooltip = false, onChange, onFocus, onBlur, value, defaultValue, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string>(
      String(value ?? defaultValue ?? "")
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(String(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const currentPassword = value !== undefined ? String(value) : internalValue;
    const { criteria, metCount, totalCount, strengthColor } = evaluatePasswordCriteria(currentPassword);

    const inputNode = (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );

    if (!showCriteriaTooltip) {
      return inputNode;
    }

    return (
      <Popover open={isFocused}>
        <PopoverAnchor asChild>{inputNode}</PopoverAnchor>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={6}
          className="w-72 p-3.5 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xs shadow-lg z-50 text-xs"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between font-medium text-slate-700 mb-2">
            <span>Password requirements</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {metCount}/{totalCount} met
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-colors duration-200",
                  i < metCount ? strengthColor : "bg-slate-100"
                )}
              />
            ))}
          </div>

          <ul className="space-y-1.5">
            {criteria.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors duration-150",
                  item.isMet ? "text-slate-900 font-medium" : "text-slate-400"
                )}
              >
                {item.isMet ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                ) : (
                  <X className="h-3.5 w-3.5 text-slate-300 shrink-0 stroke-[2]" />
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
