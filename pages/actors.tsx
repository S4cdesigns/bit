import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import FlagIcon from "mdi-react/FlagIcon";
import FlagOutlineIcon from "mdi-react/FlagOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import LabelIcon from "mdi-react/LabelIcon";
import LabelOutlineIcon from "mdi-react/LabelOutlineIcon";
import StarOutline from "mdi-react/StarBorderIcon";
import StarHalf from "mdi-react/StarHalfFullIcon";
import Star from "mdi-react/StarIcon";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import ActorCard from "../components/ActorCard";
import ActorCreator from "../components/ActorCreator";
import Button from "../components/Button";
import { CountrySelector } from "../components/CountrySelector";
import IconButtonFilter from "../components/IconButtonFilter";
import IconButtonMenu from "../components/IconButtonMenu";
import LabelSelector from "../components/LabelSelector";
import ListWrapper from "../components/ListWrapper";
import PageWrapper from "../components/PageWrapper";
import Pagination from "../components/Pagination";
import Rating from "../components/Rating";
import SortDirectionButton, { SortDirection } from "../components/SortDirectionButton";
import { fetchActors, useActorList } from "../composables/use_actor_list";
import useLabelList from "../composables/use_label_list";
import { usePaginatedList } from "../composables/use_paginated_list";
import { IActor } from "../types/actor";
import { IPaginationResult } from "../types/pagination";
import { buildQueryParser } from "../util/query_parser";

const queryParser = buildQueryParser({
  q: {
    default: "",
  },
  page: {
    default: 0,
  },
  nationality: {
    default: "",
  },
  externalLinks: {
    default: [],
  },
  sortBy: {
    default: "addedOn",
  },
  sortDir: {
    default: "desc" as SortDirection,
  },
  favorite: {
    default: false,
  },
  bookmark: {
    default: false,
  },
  rating: {
    default: 0,
  },
  labels: {
    default: [] as string[],
  },
});

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { page, q, nationality, sortBy, sortDir, favorite, bookmark, labels } =
    queryParser.parse(query);

  const result = await fetchActors(page, {
    query: q,
    nationality,
    sortBy,
    sortDir,
    favorite,
    bookmark,
    include: labels,
  });

  return {
    props: {
      page,
      initial: result,
    },
  };
};

export default function ActorListPage(props: { page: number; initial: IPaginationResult<IActor> }) {
  const router = useRouter();
  const t = useTranslations();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [rating, setRating] = useState(parsedQuery.rating);
  const [sortBy, setSortBy] = useState(parsedQuery.sortBy);
  const [sortDir, setSortDir] = useState(parsedQuery.sortDir);

  const [selectedLabels, setSelectedLabels] = useState(parsedQuery.labels);
  const [labelQuery, setLabelQuery] = useState("");

  const [nationality, setNationality] = useState(parsedQuery.nationality);

  const { labels: labelList, loading: labelLoader } = useLabelList();

  const { actors, loading, numPages, numItems, fetchActors, editActor } = useActorList(
    props.initial,
    {
      query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      nationality,
      rating,
      include: selectedLabels,
    }
  );
  const { page, onPageChange } = usePaginatedList({
    fetch: fetchActors,
    initialPage: props.page,
    querySettings: [
      query,
      favorite,
      bookmark,
      nationality,
      sortBy,
      sortDir,
      rating,
      JSON.stringify(selectedLabels),
    ],
  });

  async function refresh(): Promise<void> {
    queryParser.store(router, {
      q: query,
      nationality,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      page,
      rating,
      labels: selectedLabels,
    });
    await fetchActors(page);
  }

  const hasNoLabels = !labelLoader && !labelList.length;

  return (
    <PageWrapper title={t("foundActors", { numItems })}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundActors", { numItems })}</div>
        <div style={{ flexGrow: 1 }}></div>
        <Pagination numPages={numPages} current={page} onChange={(page) => onPageChange(page)} />
      </div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <ActorCreator onCreate={() => onPageChange(0)} />
        {/*  <Button style={{ marginRight: 10 }}>+ Bulk add</Button> */}
        {/* <Button style={{ marginRight: 10 }}>Choose</Button>
        <Button style={{ marginRight: 10 }}>Randomize</Button> */}
      </div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
        }}
      >
        <input
          type="text"
          style={{ maxWidth: 120 }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              refresh().catch(() => {});
            }
          }}
          placeholder={t("findContent")}
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
        />
        <IconButtonFilter
          value={favorite}
          onClick={() => setFavorite(!favorite)}
          activeIcon={HeartIcon}
          inactiveIcon={HeartBorderIcon}
        />
        <IconButtonFilter
          value={bookmark}
          onClick={() => setBookmark(!bookmark)}
          activeIcon={BookmarkIcon}
          inactiveIcon={BookmarkBorderIcon}
        />
        <IconButtonMenu
          value={!!rating}
          activeIcon={rating === 10 ? Star : StarHalf}
          inactiveIcon={StarOutline}
        >
          <Rating value={rating} onChange={setRating} />
        </IconButtonMenu>
        <IconButtonMenu
          counter={selectedLabels.length}
          value={!!selectedLabels.length}
          activeIcon={LabelIcon}
          inactiveIcon={LabelOutlineIcon}
          isLoading={labelLoader}
          disabled={hasNoLabels}
        >
          <input
            type="text"
            style={{ width: "100%", marginBottom: 10 }}
            placeholder={t("findLabels")}
            value={labelQuery}
            onChange={(ev) => setLabelQuery(ev.target.value)}
          />
          <LabelSelector
            selected={selectedLabels}
            items={labelList.filter(
              (label) =>
                label.name.toLowerCase().includes(labelQuery.toLowerCase()) ||
                label.aliases.some((alias) =>
                  alias.toLowerCase().includes(labelQuery.toLowerCase())
                )
            )}
            onChange={setSelectedLabels}
          />
        </IconButtonMenu>
        <IconButtonMenu value={!!nationality} activeIcon={FlagIcon} inactiveIcon={FlagOutlineIcon}>
          <CountrySelector value={nationality} onChange={setNationality} />
        </IconButtonMenu>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select value={sortBy} onChange={(ev) => setSortBy(ev.target.value)}>
            <option value="relevance">{t("relevance")}</option>
            <option value="addedOn">{t("addedToCollection")}</option>
            <option value="rawName">A-Z</option>
            <option value="bornOn">{t("age")}</option>
            <option value="rating">{t("rating")}</option>
            <option value="averageRating">{t("avgRating")}</option>
            <option value="score">{t("pvScore")}</option>
            <option value="numScenes">{t("numScenes")}</option>
            <option value="numViews">{t("numViews")}</option>
            <option value="$shuffle">{t("random")}</option>
          </select>
          <SortDirectionButton
            disabled={sortBy === "$shuffle"}
            value={sortDir}
            onChange={setSortDir}
          />
        </div>
        <div style={{ flexGrow: 1 }}></div>
        <Button loading={loading} onClick={refresh}>
          {t("refresh")}
        </Button>
      </div>
      <ListWrapper loading={loading} noResults={!numItems} size={150}>
        {actors.map((actor) => (
          <ActorCard
            onFav={(value) => {
              editActor(actor._id, (actor) => {
                actor.favorite = value;
                return actor;
              });
            }}
            onBookmark={(value) => {
              editActor(actor._id, (actor) => {
                actor.bookmark = !!value;
                return actor;
              });
            }}
            onRate={(rating) => {
              editActor(actor._id, (actor) => {
                actor.rating = rating;
                return actor;
              });
            }}
            key={actor._id}
            actor={actor}
          />
        ))}
      </ListWrapper>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </PageWrapper>
  );
}
