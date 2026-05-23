(() => {
   /*=============== DARK MODE ===============*/
   const themeButtons = document.querySelectorAll("[data-theme-toggle]"),
      rootElement = document.documentElement,
      themeStorageKey = "preferred-theme";

   let themeSwitchFrame = null;

   const getInitialTheme = () => {
      const savedTheme = localStorage.getItem(themeStorageKey);

      if (savedTheme === "dark" || savedTheme === "light") {
         return savedTheme;
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches
         ? "dark"
         : "light";
   };

   const applyTheme = (theme) => {
      const isDark = theme === "dark";

      rootElement.classList.toggle("dark", isDark);

      themeButtons.forEach((themeButton) => {
         const themeIcon = themeButton.querySelector("i"),
            themeLabel = themeButton.querySelector("span"),
            actionLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

         themeButton.classList.toggle("is-active", isDark);
         themeButton.setAttribute("aria-label", actionLabel);
         themeButton.setAttribute("title", actionLabel);

         if (themeIcon) {
            themeIcon.className = isDark ? "ri-sun-line" : "ri-moon-line";
         }

         if (themeLabel) {
            themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
         }
      });
   };

   applyTheme(getInitialTheme());

   themeButtons.forEach((themeButton) => {
      themeButton.addEventListener("click", () => {
         const nextTheme = rootElement.classList.contains("dark")
            ? "light"
            : "dark";

         rootElement.classList.add("theme-switching");
         applyTheme(nextTheme);
         localStorage.setItem(themeStorageKey, nextTheme);

         if (themeSwitchFrame !== null) {
            cancelAnimationFrame(themeSwitchFrame);
         }

         themeSwitchFrame = requestAnimationFrame(() => {
            rootElement.classList.remove("theme-switching");
            themeSwitchFrame = null;
         });
      });
   });
})();
(() => {
   /*=============== SHOW MENU ===============*/
   const navMenu = document.getElementById("nav-menu"),
      navToggle = document.getElementById("nav-toggle"),
      navClose = document.getElementById("nav-close");
   /* Menu show */
   if (navMenu && navToggle) {
      navToggle.addEventListener("click", () => {
         navMenu.classList.add("show-menu");
      });
   }

   /* Menu hidden */
   if (navMenu && navClose) {
      navClose.addEventListener("click", () => {
         navMenu.classList.remove("show-menu");
      });
   }
})();
(() => {
   /*=============== SEARCH ===============*/
   const search = document.getElementById("search"),
      searchBtn = document.getElementById("search-btn"),
      searchClose = document.getElementById("search-close");

   /* Search show */
   if (search && searchBtn) {
      searchBtn.addEventListener("click", () => {
         search.classList.add("show-search");
      });
   }

   /* Search hidden */
   if (search && searchClose) {
      searchClose.addEventListener("click", () => {
         search.classList.remove("show-search");
      });
   }
})();
(() => {
   /*=============== docs TOC ===============*/
   const article = document.querySelector("[data-docs-content]"),
      mobileToc = document.querySelector("[data-docs-toc-mobile]"),
      desktopToc = document.querySelector("[data-docs-toc-desktop]"),
      mobileTocMenu = document.querySelector(".docs_toc_mobile .docs_toc_menu"),
      pageHeader = document.querySelector(".header");

   if (!article || !mobileToc || !desktopToc) {
      return;
   }

   const slugify = (value) =>
      value
         .toLowerCase()
         .trim()
         .replace(/[^a-z0-9\s-]/g, "")
         .replace(/\s+/g, "-")
         .replace(/-+/g, "-");

   const headings = [...article.querySelectorAll("h2, h3")].filter((heading) => {
      const text = heading.textContent?.trim();

      if (!text) {
         return false;
      }

      if (!heading.id) {
         heading.id = slugify(text);
      }

      return heading.id;
   });

   if (!headings.length) {
      return;
   }

   const desktopTocLinks = [],
      setActiveDesktopLink = (id) => {
         desktopTocLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${id}`;

            link.classList.toggle("is-active", isActive);

            if (isActive) {
               link.setAttribute("aria-current", "true");
            } else {
               link.removeAttribute("aria-current");
            }
         });
      },
      scrollToHeading = (heading) => {
         const headerOffset = (pageHeader?.offsetHeight ?? 0) + 24,
            targetTop = heading.getBoundingClientRect().top + window.scrollY - headerOffset;

         window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: "smooth",
         });
      },
      buildTocLinks = () =>
         headings.map((heading) => {
            const link = document.createElement("a");

            link.href = `#${heading.id}`;
            link.textContent = heading.textContent.trim();

            if (heading.tagName === "H3") {
               link.classList.add("is-child");
            }

            link.addEventListener("click", (event) => {
               event.preventDefault();
               setActiveDesktopLink(heading.id);

               if (mobileTocMenu) {
                  mobileTocMenu.open = false;
               }

               history.replaceState(null, "", `#${heading.id}`);
               scrollToHeading(heading);
            });

            return link;
         });

   mobileToc.replaceChildren(...buildTocLinks());
   desktopToc.replaceChildren(...buildTocLinks());

   desktopTocLinks.push(...desktopToc.querySelectorAll("a"));

   setActiveDesktopLink(headings[0].id);

   const tocObserver = new IntersectionObserver(
      (entries) => {
         const visibleHeading = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
               (first, second) =>
                  first.boundingClientRect.top - second.boundingClientRect.top
            )[0];

         if (visibleHeading) {
            setActiveDesktopLink(visibleHeading.target.id);
         }
      },
      {
         rootMargin: "-18% 0px -68% 0px",
         threshold: [0, 1],
      }
   );

   headings.forEach((heading) => tocObserver.observe(heading));
})();
