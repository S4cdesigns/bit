import clsx from "clsx";
import ActorIcon from "mdi-react/AccountBoxIcon";
import StudioIcon from "mdi-react/CameraAltIcon";
import ImageIcon from "mdi-react/ImageIcon";
import MarkerIcon from "mdi-react/SkipNextIcon";
import SceneIcon from "mdi-react/VideocamIcon";
import MovieIcon from "mdi-react/VideoIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useContext } from "react";

import { useVersion } from "../../composables/use_version";
import { ThemeContext } from "../../pages/_app";
import Button from "../Button";
import Paper from "../Paper";
import styles from "./Sidebar.module.scss";

const links = [
  {
    text: "scene",
    icon: <SceneIcon />,
    url: "/scenes",
  },
  {
    text: "actor",
    icon: <ActorIcon />,
    url: "/actors",
  },
  {
    text: "movie",
    icon: <MovieIcon />,
    url: "/movies",
  },
  {
    text: "studio",
    icon: <StudioIcon />,
    url: "/studios",
  },
  {
    text: "image",
    icon: <ImageIcon />,
    url: "/images",
  },
  {
    text: "marker",
    icon: <MarkerIcon />,
    url: "/markers",
  },
];

type Props = {
  active: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ active, toggleSidebar }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const { toggleTheme } = useContext(ThemeContext);
  const { version } = useVersion();

  function switchLocale(locale: string): void {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale, scroll: false }).catch(() => {});
  }

  const sidebarContent = (
    <>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((link) => (
          <Link key={link.url} href={link.url} passHref>
            <a onClick={toggleSidebar}>
              <div
                className={clsx(
                  router.pathname === link.url ? styles.active : "",
                  styles["sidebar-link"]
                )}
              >
                {link.icon}
                <div>{t(link.text, { numItems: 2 })}</div>
              </div>
            </a>
          </Link>
        ))}
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button onClick={toggleTheme}>Toggle theme</Button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>
        <div style={{ marginTop: 4, gap: 8, display: "flex", justifyContent: "center" }}>
          <img
            className="hover"
            onClick={() => switchLocale("en")}
            src="/assets/flags/us.svg"
            width="24"
            height="24"
          />
          <img
            className="hover"
            onClick={() => switchLocale("de")}
            src="/assets/flags/de.svg"
            width="24"
            height="24"
          />
        </div>
      </div>
      <div
        style={{
          marginBottom: 5,
          textAlign: "center",
          fontSize: 14,
          fontWeight: "bold",
          opacity: 0.75,
        }}
      >
        Settings
      </div>
      <div
        style={{
          marginBottom: 5,
          textAlign: "center",
          fontSize: 14,
          fontWeight: "bold",
          opacity: 0.75,
        }}
      >
        v{version}
      </div>
    </>
  );

  return (
    <>
      {active && <div className="mobile-sidebar-darken" style={{}} onClick={toggleSidebar}></div>}
      <Paper className={clsx({ active }, "mobile-sidebar")}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 4,
          }}
        >
          {sidebarContent}
        </div>
      </Paper>
      <div className="sidebar">
        <div className="inner">{sidebarContent}</div>
      </div>
    </>
  );
}
