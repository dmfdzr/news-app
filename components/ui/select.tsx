"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  options?: SelectOption[]
  wrapperClassName?: string
  className?: string
  onChange?: (e: { target: { value: string; name?: string } }) => void
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}

function parseOptionChildren(children: React.ReactNode): {
  options: SelectOption[]
  placeholder?: string
} {
  const result: SelectOption[] = []
  let placeholder: string | undefined

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    if (child.type === "option") {
      const p = child.props as { value?: string | number; disabled?: boolean; children?: React.ReactNode }
      const val = String(p.value ?? "")
      const label = typeof p.children === "string" ? p.children : String(p.children ?? val)
      if (p.disabled && !val) {
        placeholder = label
      } else {
        result.push({
          value: val,
          label,
          disabled: p.disabled,
        })
      }
    }
  })

  return { options: result, placeholder }
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      id,
      name,
      value: controlledValue,
      defaultValue,
      placeholder: propPlaceholder,
      disabled = false,
      required = false,
      searchable,
      searchPlaceholder = "Cari opsi...",
      options: propOptions,
      wrapperClassName,
      className,
      onChange,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const { options: parsedOptions, placeholder: parsedPlaceholder } = React.useMemo(
      () => (propOptions ? { options: propOptions, placeholder: undefined } : parseOptionChildren(children)),
      [propOptions, children]
    )

    const placeholder = propPlaceholder ?? parsedPlaceholder ?? "Pilih salah satu..."
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(defaultValue ?? "")
    const isControlled = controlledValue !== undefined
    const selectedValue = isControlled ? controlledValue : uncontrolledValue

    const [isOpen, setIsOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const containerRef = React.useRef<HTMLDivElement>(null)
    const searchInputRef = React.useRef<HTMLInputElement>(null)
    const listboxId = React.useId()

    const selectedOption = parsedOptions.find((opt) => opt.value === selectedValue)
    const shouldSearch = searchable ?? parsedOptions.length > 3

    const filteredOptions = React.useMemo(() => {
      if (!query.trim()) return parsedOptions
      const q = query.toLowerCase()
      return parsedOptions.filter((opt) => opt.label.toLowerCase().includes(q))
    }, [parsedOptions, query])

    React.useEffect(() => {
      function onMouseDown(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }
      if (isOpen) {
        document.addEventListener("mousedown", onMouseDown)
      }
      return () => document.removeEventListener("mousedown", onMouseDown)
    }, [isOpen])

    React.useEffect(() => {
      if (isOpen && shouldSearch) {
        const timer = setTimeout(() => searchInputRef.current?.focus(), 50)
        return () => clearTimeout(timer)
      } else {
        setQuery("")
      }
    }, [isOpen, shouldSearch])

    function handleSelect(opt: SelectOption) {
      if (opt.disabled) return
      if (!isControlled) {
        setUncontrolledValue(opt.value)
      }
      onChange?.({ target: { value: opt.value, name } })
      onValueChange?.(opt.value)
      setIsOpen(false)
      setQuery("")
    }

    function handleKeyDown(e: React.KeyboardEvent) {
      if (disabled) return
      if (e.key === "Escape") {
        setIsOpen(false)
      } else if (e.key === "Enter" || e.key === " ") {
        if (!isOpen) {
          e.preventDefault()
          setIsOpen(true)
        }
      } else if (e.key === "ArrowDown" && !isOpen) {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    return (
      <div
        ref={containerRef}
        className={cn("relative inline-flex w-full min-w-32 flex-col", wrapperClassName)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {name && (
          <input
            type="hidden"
            name={name}
            value={selectedValue}
            required={required && !selectedValue}
          />
        )}

        <button
          ref={ref as unknown as React.Ref<HTMLButtonElement>}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-input/80 bg-background/95 px-3.5 py-2 text-left text-sm font-medium text-foreground shadow-xs transition-all duration-200 outline-none select-none",
            "hover:border-slate-400 hover:bg-accent/40 dark:hover:border-slate-600 dark:hover:bg-accent/20",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isOpen && "border-ring ring-[3px] ring-ring/40",
            className
          )}
        >
          <span className={cn("truncate", !selectedOption && "text-muted-foreground font-normal")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180 text-foreground"
            )}
          />
        </button>

        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute top-full z-50 mt-1.5 flex max-h-72 w-full min-w-44 flex-col overflow-hidden rounded-2xl border border-border/80 bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-md ring-1 ring-black/5 duration-150 animate-in fade-in-0 zoom-in-95 dark:ring-white/10"
          >
            {shouldSearch && (
              <div className="relative mb-1 flex items-center px-1">
                <SearchIcon className="absolute left-3 size-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-8 w-full rounded-xl border border-input/60 bg-muted/50 pr-7 pl-8 text-xs font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="size-3" />
                  </button>
                )}
              </div>
            )}

            <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto pr-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Tidak ada opsi yang sesuai
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === selectedValue
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      className={cn(
                        "group/select-item flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors outline-none select-none",
                        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        isSelected && "bg-accent/90 text-accent-foreground font-semibold",
                        opt.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <CheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"
