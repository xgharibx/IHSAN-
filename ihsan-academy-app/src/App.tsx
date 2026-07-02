import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";

const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const KnowledgeTree = lazy(() => import("@/pages/KnowledgeTree"));
const Study = lazy(() => import("@/pages/Study"));
const Activities = lazy(() => import("@/pages/Activities"));
const AiTutor = lazy(() => import("@/pages/AiTutor"));
const Synthesis = lazy(() => import("@/pages/Synthesis"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const CourseList = lazy(() => import("@/pages/CourseList"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // NOTE: Lenis (smooth-scroll library) was removed on purpose. It hijacks
    // wheel/touch events to drive its own virtual scroll position, which can
    // fall out of sync with the browser's real scrollbar — the exact bug
    // reported repeatedly ("scroll gets stuck, have to grab/hold the
    // scrollbar to continue"). This can happen with a mouse too, not just
    // touch. Plain native scrolling never has this problem. Anchor links
    // (href="#...") still get a smooth scroll below via the native
    // `scrollIntoView`, and `services/lenis.ts`'s `scrollTo`/`scrollToTop`
    // helpers already fall back to native smooth scroll when no Lenis
    // instance is registered (which is now always the case).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <Layout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/knowledge-tree" element={<KnowledgeTree />} />
          <Route path="/study" element={<Study />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/tutor" element={<AiTutor />} />
          <Route path="/synthesis" element={<Synthesis />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
