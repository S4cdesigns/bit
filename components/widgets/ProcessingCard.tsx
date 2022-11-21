import SettingsIcon from "mdi-react/SettingsIcon";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import { graphqlQuery } from "../../util/gql";
import Loader from "../Loader";
import Text from "../Text";
import WidgetCard from "./WidgetCard";

async function getQueueStats() {
  const query = `
  { 
    getQueueInfo {    
      length 
      processing 
    }
  }`;

  const { getQueueInfo } = await graphqlQuery<{
    getQueueInfo: {
      length: number;
      processing: boolean;
    };
  }>(query, {});

  return getQueueInfo;
}

export default function ProcessingCard() {
  const t = useTranslations();

  const { data: stats } = useSWR("processingQueueStats", getQueueStats, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 5_000,
  });

  return (
    <WidgetCard icon={<SettingsIcon />} title={t("videoProcessingQueue")}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div>
          <Text>
            {t("video", {
              numItems: stats?.length || 0,
            })}
          </Text>
        </div>
        {stats?.processing && <Loader />}
        {/* TODO: scan button */}
      </div>
    </WidgetCard>
  );
}