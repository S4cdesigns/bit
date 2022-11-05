import { Masonry } from "masonic";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
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

import Button from "../components/Button";
import IconButtonFilter from "../components/IconButtonFilter";
import IconButtonMenu from "../components/IconButtonMenu";
import ImageCard from "../components/ImageCard";
import LabelSelector from "../components/LabelSelector";
import Pagination from "../components/Pagination";
import Rating from "../components/Rating";
import SortDirectionButton, { SortDirection } from "../components/SortDirectionButton";
import { fetchImages, useImageList } from "../composables/use_image_list";
import useLabelList from "../composables/use_label_list";
import { useWindowSize } from "../composables/use_window_size";
import { IImage } from "../types/image";
import { IPaginationResult } from "../types/pagination";
import { buildQueryParser } from "../util/query_parser";
import { imageUrl, thumbnailUrl } from "../util/thumbnail";
import PageWrapper from "../components/PageWrapper";
import ImageUploader from "../components/ImageUploader";
import ContentWrapper from "../components/ContentWrapper";
import Paper from "../components/Paper";
import ListContainer from "../components/ListContainer";
import { usePaginatedList } from "../composables/use_paginated_list";

const queryParser = buildQueryParser({
  q: {
    default: "",
  },
  page: {
    default: 0,
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
  const { page, q, sortBy, sortDir, favorite, bookmark, labels } = queryParser.parse(query);

  const result = await fetchImages(page, {
    query: q,
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

export default function ImageListPage(props: { page: number; initial: IPaginationResult<IImage> }) {
  const router = useRouter();
  const t = useTranslations();
  const { width: windowWidth } = useWindowSize();

  const [activeIndex, setActive] = useState<number>(-1);

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [rating, setRating] = useState(parsedQuery.rating);
  const [sortBy, setSortBy] = useState(parsedQuery.sortBy);
  const [sortDir, setSortDir] = useState(parsedQuery.sortDir);

  const [labelQuery, setLabelQuery] = useState("");
  const [selectedLabels, setSelectedLabels] = useState(parsedQuery.labels);

  const { labels: labelList, loading: labelLoader } = useLabelList();

  const { images, fetchImages, loading, numItems, numPages, prependImages } = useImageList(
    props.initial,
    {
      rating,
      query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      include: selectedLabels,
    }
  );
  const { page, onPageChange } = usePaginatedList({
    fetch: fetchImages,
    initialPage: props.page,
    querySettings: [
      query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      rating,
      JSON.stringify(selectedLabels),
    ],
  });

  async function refresh(): Promise<void> {
    queryParser.store(router, {
      q: query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      page,
      rating,
      labels: selectedLabels,
    });
    await fetchImages(page);
  }

  const hasNoLabels = !labelLoader && !labelList.length;

  return (
    <PageWrapper title={t("foundImages", { numItems })}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundImages", { numItems })}</div>
        <div style={{ flexGrow: 1 }}></div>
        <Pagination numPages={numPages} current={page} onChange={(page) => onPageChange(page)} />
      </div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <ImageUploader onDone={() => console.log("done")} onUpload={prependImages} />
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
        <select value={sortBy} onChange={(ev) => setSortBy(ev.target.value)}>
          <option value="relevance">{t("relevance")}</option>
          <option value="addedOn">{t("addedToCollection")}</option>
          <option value="rating">{t("rating")}</option>
        </select>
        <SortDirectionButton
          disabled={sortBy === "$shuffle"}
          value={sortDir}
          onChange={setSortDir}
        />
        <div style={{ flexGrow: 1 }}></div>
        <Button onClick={refresh}>{t("refresh")}</Button>
      </div>
      <ContentWrapper
        loader={
          <ListContainer>
            {[...new Array(16)].map((_, i) => (
              <Paper style={{ height: 150 }} key={i} className="skeleton-card"></Paper>
            ))}
          </ListContainer>
        }
        loading={loading}
        noResults={!images.length}
      >
        <Masonry
          items={images}
          rowGutter={0}
          columnGutter={4}
          columnCount={(windowWidth || 1080) < 480 ? 2 : undefined}
          columnWidth={225}
          render={({ data, index }) => (
            <ImageCard
              // TODO: use a "hasPrevious" prop instead
              onPrevious={index > 0 ? () => setActive(index - 1) : undefined}
              onNext={index < images.length - 1 ? () => setActive(index + 1) : undefined}
              onOpen={() => setActive(index)}
              onClose={() => setActive(-1)}
              active={index === activeIndex}
              favorite={data.favorite}
              bookmark={data.bookmark}
              rating={data.rating}
              key={data._id}
              fullSrc={imageUrl(data._id)}
              src={thumbnailUrl(data._id)}
              alt={data.name}
            />
          )}
        />
      </ContentWrapper>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </PageWrapper>
  );
}
