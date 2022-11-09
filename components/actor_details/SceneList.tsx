import ActorIcon from "mdi-react/AccountIcon";
import ActorOutlineIcon from "mdi-react/AccountOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import LabelIcon from "mdi-react/LabelIcon";
import LabelOutlineIcon from "mdi-react/LabelOutlineIcon";
import StarOutline from "mdi-react/StarBorderIcon";
import StarHalf from "mdi-react/StarHalfFullIcon";
import Star from "mdi-react/StarIcon";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useCollabs } from "../../composables/use_collabs";
import useLabelList from "../../composables/use_label_list";
import { useSceneList } from "../../composables/use_scene_list";
import useUpdateEffect from "../../composables/use_update_effect";
import ActorSelector from "../ActorSelector";
import Button from "../Button";
import CardTitle from "../CardTitle";
import IconButtonFilter from "../IconButtonFilter";
import IconButtonMenu from "../IconButtonMenu";
import LabelSelector from "../LabelSelector";
import ListWrapper from "../ListWrapper";
import Pagination from "../Pagination";
import Rating from "../Rating";
import SceneCard from "../SceneCard";

type QueryState = {
  q: string;
  favorite: boolean;
  bookmark: boolean;
  rating: number;
  actors: string[];
  labels: string[];
  page: number;
};

type Props = {
  actorId: string;
  initialState: QueryState;
  writeQuery: (qs: QueryState) => void;
};

export default function ActorDetailsPageSceneList(props: Props) {
  const t = useTranslations();

  const { collabs, loading: collabsLoader } = useCollabs(props.actorId);
  const { labels: labelList, loading: labelLoader } = useLabelList();

  const [query, setQuery] = useState(props.initialState.q);
  const [favorite, setFavorite] = useState(props.initialState.favorite);
  const [bookmark, setBookmark] = useState(props.initialState.bookmark);
  const [rating, setRating] = useState(props.initialState.rating);

  const [selectedActors, setSelectedActors] = useState(props.initialState.actors);
  const [actorQuery, setActorQuery] = useState("");

  const [selectedLabels, setSelectedLabels] = useState(props.initialState.labels);
  const [labelQuery, setLabelQuery] = useState("");

  const [page, setPage] = useState(props.initialState.page);
  const {
    scenes,
    editScene,
    fetchScenes,
    numItems: numScenes,
    numPages: numScenePages,
    loading: sceneLoader,
  } = useSceneList(
    {
      items: [],
      numItems: 0,
      numPages: 0,
    },
    {
      actors: [props.actorId, ...selectedActors],
      include: selectedLabels,
      query,
      favorite,
      bookmark,
      rating,
    }
  );

  async function refreshScenes(): Promise<void> {
    props.writeQuery({
      q: query,
      page,
      favorite,
      bookmark,
      rating,
      labels: selectedLabels,
      actors: selectedActors,
    });
    await fetchScenes(page);
  }

  async function onPageChange(x: number): Promise<void> {
    setPage(x);
    await fetchScenes(x);
  }

  useUpdateEffect(() => {
    setPage(0);
  }, [
    query,
    favorite,
    bookmark,
    rating,
    JSON.stringify(selectedActors),
    JSON.stringify(selectedLabels),
  ]);

  useEffect(() => {
    refreshScenes().catch(() => {});
  }, [page]);

  const hasNoCollabs = !collabsLoader && !collabs.length;
  const hasNoLabels = !labelLoader && !labelList.length;

  return (
    <div>
      <CardTitle style={{ marginBottom: 20 }}>
        {sceneLoader ? (
          "Loading..."
        ) : (
          <span>
            {numScenes} {t("scene", { numItems: numScenes })}
          </span>
        )}
      </CardTitle>
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
              refreshScenes().catch(() => {});
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
        <IconButtonMenu
          counter={selectedActors.length}
          value={!!selectedActors.length}
          activeIcon={ActorIcon}
          inactiveIcon={ActorOutlineIcon}
          isLoading={collabsLoader}
          disabled={hasNoCollabs}
        >
          <input
            type="text"
            style={{ width: "100%", marginBottom: 10 }}
            placeholder={t("findActors")}
            value={actorQuery}
            onChange={(ev) => setActorQuery(ev.target.value)}
          />
          <ActorSelector
            selected={selectedActors}
            items={collabs.filter(
              (collab) =>
                collab.name.toLowerCase().includes(actorQuery.toLowerCase()) ||
                collab.aliases.some((alias) =>
                  alias.toLowerCase().includes(actorQuery.toLowerCase())
                )
            )}
            onChange={setSelectedActors}
          />
        </IconButtonMenu>
        <div style={{ flexGrow: 1 }}></div>
        <Button loading={sceneLoader} onClick={refreshScenes}>
          {t("refresh")}
        </Button>
      </div>
      <ListWrapper loading={sceneLoader} noResults={!numScenes}>
        {scenes.map((scene) => (
          <SceneCard
            onFav={(value) => {
              editScene(scene._id, (scene) => {
                scene.favorite = value;
                return scene;
              });
            }}
            onBookmark={(value) => {
              editScene(scene._id, (scene) => {
                scene.bookmark = !!value;
                return scene;
              });
            }}
            onRate={(rating) => {
              editScene(scene._id, (scene) => {
                scene.rating = rating;
                return scene;
              });
            }}
            key={scene._id}
            scene={scene}
          />
        ))}
      </ListWrapper>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numScenePages} current={page} onChange={onPageChange} />
      </div>
    </div>
  );
}
