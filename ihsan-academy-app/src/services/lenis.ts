// Singleton Lenis instance so any component can trigger smooth scroll.
// The instance is set up by App.tsx on mount. As of 2026-07-02, App.tsx no
// longer creates a Lenis instance at all (it caused a recurring "scroll gets
// stuck, must grab the scrollbar to continue" bug by hijacking wheel events
// and driving a virtual scroll position that could desync from the browser's
// real scrollbar). `instance` therefore stays null and every call below goes
// through the native-scroll fallback path, which is intentional.
let instance: any = null;

export const setLenis = (l: any) => {
  instance = l;
};

export const scrollTo = (target: string | number | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => {
  if (!instance) {
    // Fallback: native smooth scroll, honoring an optional pixel offset
    // (used to keep a target section from being hidden under the sticky
    // header) since scrollIntoView alone has no offset support.
    const offset = opts?.offset ?? 0;
    const behavior: ScrollBehavior = opts?.immediate ? "auto" : "smooth";
    let el: Element | null = null;
    if (typeof target === "string") {
      el = target.startsWith("#") ? document.querySelector(target) : document.getElementById(target);
    } else if (target instanceof HTMLElement) {
      el = target;
    }
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target + offset, behavior });
    }
    return;
  }
  instance.scrollTo(target, opts);
};

export const scrollToTop = () => {
  scrollTo(0, { immediate: false });
};