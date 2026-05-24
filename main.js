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
      docsPage = document.body.dataset.docsPage,
      docsPanelToggles = document.querySelectorAll("[data-docs-panel-toggle]"),
      docsMobileBar = document.querySelector(".docs_mobile_bar"),
      mobileSidebar = document.querySelector("[data-docs-sidebar-mobile]"),
      desktopSidebar = document.querySelector("[data-docs-sidebar-desktop]"),
      mobileToc = document.querySelector("[data-docs-toc-mobile]"),
      desktopToc = document.querySelector("[data-docs-toc-desktop]"),
      mobileSidebarMenu = document.querySelector(
         ".docs_sidebar_mobile .docs_sidebar_menu"
      ),
      mobileTocMenu = document.querySelector(".docs_toc_mobile .docs_toc_menu"),
      pageHeader = document.querySelector(".header"),
      mobilePanels = {
         sidebar: mobileSidebar?.closest(".docs_sidebar_mobile"),
         toc: mobileToc?.closest(".docs_toc_mobile"),
      };

   if (
      !article ||
      !docsPage ||
      !mobileSidebar ||
      !desktopSidebar ||
      !mobileToc ||
      !desktopToc
   ) {
      return;
   }

   const docsNavigation = [
      {
         label: "Guide",
         items: [
            {
               page: "docs-overview",
               title: "Overview",
               href: "docs.html",
            },
            {
               page: "docs-getting-started",
               title: "Getting Started",
               href: "docs-getting-started.html",
            },
         ],
      },
      {
         label: "Reference",
         items: [
            {
               page: "docs-reference",
               title: "Theme & Layout",
               href: "docs-reference.html",
            },
         ],
      },
   ];

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

   const sectionNavigationLinks = [],
      closeMobilePanels = () => {
         Object.values(mobilePanels).forEach((panel) => {
            panel?.classList.remove("is-open");
         });

         docsPanelToggles.forEach((toggle) => {
            toggle.setAttribute("aria-expanded", "false");
            toggle.classList.remove("is-active");
         });
      },
      toggleMobilePanel = (panelName) => {
         const targetPanel = mobilePanels[panelName];

         if (!targetPanel) {
            return;
         }

         const shouldOpen = !targetPanel.classList.contains("is-open");

         closeMobilePanels();

         if (!shouldOpen) {
            return;
         }

         targetPanel.classList.add("is-open");

         if (panelName === "sidebar" && mobileSidebarMenu) {
            mobileSidebarMenu.open = true;
         }

         if (panelName === "toc" && mobileTocMenu) {
            mobileTocMenu.open = true;
         }

         docsPanelToggles.forEach((toggle) => {
            const isTarget = toggle.dataset.docsPanelToggle === panelName;

            toggle.classList.toggle("is-active", isTarget);
            toggle.setAttribute("aria-expanded", isTarget ? "true" : "false");
         });
      },
      setActiveSectionLinkState = (id) => {
         sectionNavigationLinks.forEach((link) => {
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
      createSectionLink = (heading, classNames = []) => {
         const link = document.createElement("a");

         link.href = `#${heading.id}`;
         link.textContent = heading.textContent.trim();
         link.classList.add(...classNames);
         sectionNavigationLinks.push(link);

         link.addEventListener("click", (event) => {
            event.preventDefault();
            setActiveSectionLinkState(heading.id);

            if (mobileSidebarMenu) {
               mobileSidebarMenu.open = false;
            }

            if (mobileTocMenu) {
               mobileTocMenu.open = false;
            }

            closeMobilePanels();

            history.replaceState(null, "", `#${heading.id}`);
            scrollToHeading(heading);
         });

         return link;
      },
      buildTocLinks = () =>
         headings.map((heading) =>
            createSectionLink(
               heading,
               heading.tagName === "H3" ? ["is-child"] : []
            )
         ),
      buildSidebarNavigation = (container) => {
         const fragment = document.createDocumentFragment();

         docsNavigation.forEach((group) => {
            const section = document.createElement("details"),
               sectionSummary = document.createElement("summary"),
               sectionTitle = document.createElement("span"),
               sectionIcon = document.createElement("i"),
               pageList = document.createElement("div");

            const hasCurrentPage = group.items.some((item) => item.page === docsPage);

            section.className = "docs_sidebar_group";
            section.open = true;
            sectionSummary.className = "docs_sidebar_group_summary";
            sectionTitle.className = "docs_sidebar_group_title";
            sectionTitle.textContent = group.label;
            sectionIcon.className = "ri-arrow-right-s-line";
            sectionIcon.setAttribute("aria-hidden", "true");
            pageList.className = "docs_sidebar_page_list";

            if (hasCurrentPage) {
               section.classList.add("is-current-group");
            }

            sectionSummary.append(sectionTitle, sectionIcon);

            group.items.forEach((item) => {
               const pageLink = document.createElement("a");

               pageLink.className = "docs_sidebar_link docs_sidebar_page_link";
               pageLink.href = item.href;
               pageLink.textContent = item.title;

               if (item.page === docsPage) {
                  pageLink.classList.add("is-active", "is-current-page");
                  pageLink.setAttribute("aria-current", "page");

                  pageLink.addEventListener("click", (event) => {
                     event.preventDefault();

                     if (mobileSidebarMenu) {
                        mobileSidebarMenu.open = false;
                     }

                     closeMobilePanels();

                     history.replaceState(null, "", item.href);
                     window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                     });
                  });
               }

               pageList.append(pageLink);
            });

            section.append(sectionSummary, pageList);
            fragment.append(section);
         });

         container.replaceChildren(fragment);
      },
      initialHeading =
         headings.find((heading) => `#${heading.id}` === window.location.hash) ||
         headings[0];

   buildSidebarNavigation(mobileSidebar);
   buildSidebarNavigation(desktopSidebar);
   mobileToc.replaceChildren(...buildTocLinks());
   desktopToc.replaceChildren(...buildTocLinks());

   docsPanelToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
         toggleMobilePanel(toggle.dataset.docsPanelToggle);
      });
   });

   document.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
         return;
      }

      if (
         target.closest(".docs_mobile_bar") ||
         target.closest(".docs_sidebar_mobile") ||
         target.closest(".docs_toc_mobile")
      ) {
         return;
      }

      closeMobilePanels();
   });

   window.addEventListener("resize", () => {
      if (window.innerWidth >= 1023) {
         closeMobilePanels();
      }
   });

   setActiveSectionLinkState(initialHeading.id);

   const tocObserver = new IntersectionObserver(
      (entries) => {
         const visibleHeading = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
               (first, second) =>
                  first.boundingClientRect.top - second.boundingClientRect.top
            )[0];

         if (visibleHeading) {
            setActiveSectionLinkState(visibleHeading.target.id);
         }
      },
      {
         rootMargin: "-18% 0px -68% 0px",
         threshold: [0, 1],
      }
   );

   headings.forEach((heading) => tocObserver.observe(heading));
})();
