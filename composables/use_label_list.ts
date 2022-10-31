import axios from "axios";
import { useEffect, useState } from "react";

import ILabel from "../types/label";
import { gqlIp } from "../util/ip";

async function fetchLabels() {
  const { data } = await axios.post<{
    data: {
      getLabels: ILabel[];
    };
  }>(
    gqlIp(),
    {
      query: `
{
  getLabels {
    _id
    name
    aliases
    color
  }
}
      `,
      variables: {},
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );
  return data.data.getLabels;
}

export default function useLabelList() {
  const [labels, setLabels] = useState<ILabel[]>([]);
  const [loader, setLoader] = useState(true);

  async function load() {
    try {
      setLoader(true);
      setLabels(await fetchLabels());
    } catch (error) {}
    setLoader(false);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return {
    labels,
    loading: loader,
  };
}
