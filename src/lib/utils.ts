import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// index.css @theme의 커스텀 글자 크기·그림자 이름을 알려줘야 text-caption과 text-ink를
// 같은 그룹(색)으로 오인해 하나를 지우지 않는다.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "caption", "body", "emph", "section", "title", "display", "display-lg"],
      shadow: ["card", "primary", "fab"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
