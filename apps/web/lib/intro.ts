// The home-page launch intro plays once per browser session. This key is shared by the intro
// (app/components/IntroLoader.tsx) and the pre-paint script in the root layout that hides it.
export const INTRO_SEEN_KEY = "ignite-intro-seen";

/** Runs before the page paints: marks <html data-intro="seen"> so CSS hides the intro straight away. */
export const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)})==="1")document.documentElement.setAttribute("data-intro","seen")}catch(e){}`;
