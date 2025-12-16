"use client"

import { useTranslation } from "react-i18next"
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          <span className="mr-2">🇬🇧</span> English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('es')}>
          <span className="mr-2">🇪🇸</span> Español
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('ru')}>
          <span className="mr-2">🇷🇺</span> Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
