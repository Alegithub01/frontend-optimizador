"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface Country {
  name: string
  code: string
  phoneCode: string
  flag: string
}

export const countries: Country[] = [
  { name: "Afghanistan", code: "AF", phoneCode: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "AL", phoneCode: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", phoneCode: "+213", flag: "🇩🇿" },
  { name: "Argentina", code: "AR", phoneCode: "+54", flag: "🇦🇷" },
  { name: "Australia", code: "AU", phoneCode: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "AT", phoneCode: "+43", flag: "🇦🇹" },
  { name: "Bangladesh", code: "BD", phoneCode: "+880", flag: "🇧🇩" },
  { name: "Belgium", code: "BE", phoneCode: "+32", flag: "🇧🇪" },
  { name: "Bolivia", code: "BO", phoneCode: "+591", flag: "🇧🇴" },
  { name: "Brazil", code: "BR", phoneCode: "+55", flag: "🇧🇷" },
  { name: "Canada", code: "CA", phoneCode: "+1", flag: "🇨🇦" },
  { name: "Chile", code: "CL", phoneCode: "+56", flag: "🇨🇱" },
  { name: "China", code: "CN", phoneCode: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "CO", phoneCode: "+57", flag: "🇨🇴" },
  { name: "Costa Rica", code: "CR", phoneCode: "+506", flag: "🇨🇷" },
  { name: "Cuba", code: "CU", phoneCode: "+53", flag: "🇨🇺" },
  { name: "Denmark", code: "DK", phoneCode: "+45", flag: "🇩🇰" },
  { name: "Dominican Republic", code: "DO", phoneCode: "+1", flag: "🇩🇴" },
  { name: "Ecuador", code: "EC", phoneCode: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "EG", phoneCode: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "SV", phoneCode: "+503", flag: "🇸🇻" },
  { name: "Finland", code: "FI", phoneCode: "+358", flag: "🇫🇮" },
  { name: "France", code: "FR", phoneCode: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "DE", phoneCode: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", phoneCode: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "GR", phoneCode: "+30", flag: "🇬🇷" },
  { name: "Guatemala", code: "GT", phoneCode: "+502", flag: "🇬🇹" },
  { name: "Honduras", code: "HN", phoneCode: "+504", flag: "🇭🇳" },
  { name: "India", code: "IN", phoneCode: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", phoneCode: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "IR", phoneCode: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", phoneCode: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "IE", phoneCode: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "IL", phoneCode: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "IT", phoneCode: "+39", flag: "🇮🇹" },
  { name: "Jamaica", code: "JM", phoneCode: "+1", flag: "🇯🇲" },
  { name: "Japan", code: "JP", phoneCode: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "JO", phoneCode: "+962", flag: "🇯🇴" },
  { name: "Kenya", code: "KE", phoneCode: "+254", flag: "🇰🇪" },
  { name: "South Korea", code: "KR", phoneCode: "+82", flag: "🇰🇷" },
  { name: "Kuwait", code: "KW", phoneCode: "+965", flag: "🇰🇼" },
  { name: "Lebanon", code: "LB", phoneCode: "+961", flag: "🇱🇧" },
  { name: "Malaysia", code: "MY", phoneCode: "+60", flag: "🇲🇾" },
  { name: "Mexico", code: "MX", phoneCode: "+52", flag: "🇲🇽" },
  { name: "Morocco", code: "MA", phoneCode: "+212", flag: "🇲🇦" },
  { name: "Netherlands", code: "NL", phoneCode: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "NZ", phoneCode: "+64", flag: "🇳🇿" },
  { name: "Nicaragua", code: "NI", phoneCode: "+505", flag: "🇳🇮" },
  { name: "Nigeria", code: "NG", phoneCode: "+234", flag: "🇳🇬" },
  { name: "Norway", code: "NO", phoneCode: "+47", flag: "🇳🇴" },
  { name: "Pakistan", code: "PK", phoneCode: "+92", flag: "🇵🇰" },
  { name: "Panama", code: "PA", phoneCode: "+507", flag: "🇵🇦" },
  { name: "Paraguay", code: "PY", phoneCode: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "PE", phoneCode: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", phoneCode: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "PL", phoneCode: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", phoneCode: "+351", flag: "🇵🇹" },
  { name: "Puerto Rico", code: "PR", phoneCode: "+1", flag: "🇵🇷" },
  { name: "Qatar", code: "QA", phoneCode: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "RO", phoneCode: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "RU", phoneCode: "+7", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "SA", phoneCode: "+966", flag: "🇸🇦" },
  { name: "Singapore", code: "SG", phoneCode: "+65", flag: "🇸🇬" },
  { name: "South Africa", code: "ZA", phoneCode: "+27", flag: "🇿🇦" },
  { name: "Spain", code: "ES", phoneCode: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "LK", phoneCode: "+94", flag: "🇱🇰" },
  { name: "Sweden", code: "SE", phoneCode: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", phoneCode: "+41", flag: "🇨🇭" },
  { name: "Thailand", code: "TH", phoneCode: "+66", flag: "🇹🇭" },
  { name: "Turkey", code: "TR", phoneCode: "+90", flag: "🇹🇷" },
  { name: "Ukraine", code: "UA", phoneCode: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", phoneCode: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", phoneCode: "+44", flag: "🇬🇧" },
  { name: "United States", code: "US", phoneCode: "+1", flag: "🇺🇸" },
  { name: "Uruguay", code: "UY", phoneCode: "+598", flag: "🇺🇾" },
  { name: "Venezuela", code: "VE", phoneCode: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", phoneCode: "+84", flag: "🇻🇳" },
]

interface CountrySelectorProps {
  value?: Country | null
  onValueChange: (country: Country) => void
  placeholder?: string
}

export function CountrySelector({ value, onValueChange, placeholder = "Seleccionar país..." }: CountrySelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? (
            <div className="flex items-center gap-2">
              <span>{value.flag}</span>
              <span>{value.name}</span>
              <span className="text-muted-foreground">({value.phoneCode})</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full bg-white p-0">
        <Command>
          <CommandInput placeholder="Buscar país..." />
          <CommandList>
            <CommandEmpty>No se encontró el país.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.phoneCode}`}
                  onSelect={() => {
                    onValueChange(country)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value?.code === country.code ? "opacity-100" : "opacity-0")} />
                  <div className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="text-muted-foreground">({country.phoneCode})</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
