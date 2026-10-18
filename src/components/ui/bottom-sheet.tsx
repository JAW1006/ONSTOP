import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { usePortalContainer } from "./portal-container";

/** 하단 시트(레거시 Sheet). 폰 프레임 안에서만 열린다. Esc·딤 클릭·닫기 버튼으로 닫힌다. */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const container = usePortalContainer();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Overlay className="absolute inset-0 z-50 bg-(--ts-overlay) data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="absolute inset-x-0 bottom-0 z-50 max-h-[80%] overflow-y-auto rounded-t-2xl bg-background p-[18px] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom"
        >
          <div className="mb-3.5 flex items-center justify-between">
            <Dialog.Title className="text-emph font-extrabold text-ink">{title}</Dialog.Title>
            <Dialog.Close aria-label={t("common.dismiss")} className="cursor-pointer p-1 text-faint">
              <X size={18} aria-hidden />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
