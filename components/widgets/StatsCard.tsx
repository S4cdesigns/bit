import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Axios from "axios";
import StatsIcon from "mdi-react/ChartBarStackedIcon";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import WidgetCard from "./WidgetCard";

async function getInfo() {
  const res = await Axios.post("/api/ql", {
    query: `
    {
      numScenes
      numActors
      numMovies
      numImages
      numStudios
    }
    `,
  });
  return {
    numScenes: res.data.data.numScenes as number,
    numActors: res.data.data.numActors as number,
    numMovies: res.data.data.numMovies as number,
    numImages: res.data.data.numImages as number,
    numStudios: res.data.data.numStudios as number,
  };
}

export default function StatsCard() {
  const t = useTranslations();

  const { data: stats } = useSWR("stats", getInfo, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 60000,
  });

  return (
    <WidgetCard icon={<StatsIcon />} title={t("stats")}>
      <Stack divider={<Divider sx={{ margin: 1 }} flexItem />}>
        <Typography>
          <Typography component="span" variant="h4">
            {stats?.numScenes || 0}
          </Typography>{" "}
          <span style={{ opacity: 0.8 }}>{t("scene", { numItems: stats?.numScenes || 0 })}</span>
        </Typography>
        <Typography>
          <Typography component="span" variant="h4">
            {stats?.numActors || 0}
          </Typography>{" "}
          <span style={{ opacity: 0.8 }}> {t("actor", { numItems: stats?.numActors || 0 })}</span>
        </Typography>
        <Typography>
          <Typography component="span" variant="h4">
            {stats?.numMovies || 0}
          </Typography>{" "}
          <span style={{ opacity: 0.8 }}> {t("movie", { numItems: stats?.numMovies || 0 })}</span>
        </Typography>
        <Typography>
          <Typography component="span" variant="h4">
            {stats?.numStudios || 0}
          </Typography>{" "}
          <span style={{ opacity: 0.8 }}> {t("studio", { numItems: stats?.numStudios || 0 })}</span>
        </Typography>
        <Typography>
          <Typography component="span" variant="h4">
            {stats?.numImages || 0}
          </Typography>{" "}
          <span style={{ opacity: 0.8 }}> {t("image", { numItems: stats?.numImages || 0 })}</span>
        </Typography>
      </Stack>
    </WidgetCard>
  );
}
