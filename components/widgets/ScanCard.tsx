import Axios from "axios";
import SettingsIcon from "mdi-react/SettingsIcon";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import Loader from "../Loader";
import WidgetCard from "./WidgetCard";

async function getQueueStats() {
  const { data } = await Axios.post<{
    data: {
      getQueueInfo: {
        length: number;
        processing: boolean;
      };
    };
  }>("/api/ql", {
    query: `
{ 
  getQueueInfo {    
    length 
    processing 
  }
}
    `,
  });
  return data.data.getQueueInfo;
}

export default function LibraryTimeCard() {
  const t = useTranslations();

  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    getQueueStats()
      .then((info) => {
        setActive(info.processing);
        setCount(info.length);
      })
      .catch(() => {});
  }, []);

  return (
    <WidgetCard icon={<SettingsIcon />} title={t("videoProcessingQueue")}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div>
          {t("video", {
            numItems: count,
          })}
        </div>
        {active && <Loader />}
      </div>
    </WidgetCard>
  );
}
