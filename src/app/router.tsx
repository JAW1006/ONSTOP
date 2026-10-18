import { createBrowserRouter, type RouteObject } from "react-router";
import { PhoneFrame } from "@/app/PhoneFrame";
import { PlaceholderPage } from "@/app/PlaceholderPage";
import { TabLayout } from "@/app/TabLayout";
import { UiShowcase } from "@/app/UiShowcase";
import { BookingScreen } from "@/features/booking/BookingScreen";
import { BookingsScreen } from "@/features/booking/BookingsScreen";
import { CourseScreen } from "@/features/course/CourseScreen";
import { SavedCourseScreen } from "@/features/course/SavedCourseScreen";
import { HomeScreen } from "@/features/home/HomeScreen";
import { OnboardingScreen } from "@/features/time-safe/OnboardingScreen";

// 라우트 표: docs/design/screens/app-shell.md. 자리 화면은 4단계에서 features/* 화면으로 교체.
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <PhoneFrame />,
    children: [
      { path: "onboarding", element: <OnboardingScreen /> },
      {
        element: <TabLayout />,
        children: [
          { index: true, element: <HomeScreen /> },
          { path: "luggage", element: <PlaceholderPage titleKey="luggage.title" /> },
          { path: "course", element: <CourseScreen /> },
          { path: "course/saved", element: <SavedCourseScreen /> },
          { path: "booking/:roomId", element: <BookingScreen /> },
          { path: "bookings", element: <BookingsScreen /> },
          { path: "my", element: <PlaceholderPage titleKey="my.title" /> },
          // 개발 모드 전용 컴포넌트 견본
          ...(import.meta.env.DEV ? [{ path: "dev/ui", element: <UiShowcase /> }] : []),
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
