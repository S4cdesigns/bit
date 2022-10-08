import axios from "axios";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import Card from "../../components/Card";
import { actorCardFragment } from "../../fragments/actor";

import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";

import { sceneCardFragment } from "../../fragments/scene";
import { IMovie } from "../../types/movie";
import { thumbnailUrl } from "../../util/thumbnail";
import ListWrapper from "../../components/ListWrapper";
import ResponsiveImage from "../../components/ResponsiveImage";
import SceneCard from "../../components/SceneCard";
import CardTitle from "../../components/CardTitle";
import ActorCard from "../../components/ActorCard";
import CardSection from "../../components/CardSection";
import Link from "next/link";
import Rating from "../../components/Rating";
import LabelGroup from "../../components/LabelGroup";
import { formatDuration } from "../../util/string";
import prettyBytes from "pretty-bytes";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
      query ($id: String!) {
        getMovieById(id: $id) {
          _id
          name
          description
          releaseDate
          duration
          size
          favorite
          bookmark
          rating
          frontCover {
            _id
            color
          }
          backCover {
            _id
            color
          }
          spineCover {
            _id
          }
          actors {
            ...ActorCard
          }
          labels {
            _id
            name
            color
          }
          studio {
            _id
            name
            thumbnail {
              _id
            }
          }
          scenes {
            ...SceneCard
          }
        }
      }
      ${sceneCardFragment}
      ${actorCardFragment}
      `,
      variables: {
        id: ctx.query.id,
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return {
    props: {
      movie: data.data.getMovieById,
    },
  };
};

export default function ScenePage({ movie }: { movie: IMovie }) {
  const t = useTranslations();

  return (
    <>
      <Head>
        <title>{movie.name}</title>
      </Head>
      <div
        style={{
          flexWrap: "wrap",
          display: "flex",
          justifyContent: "center",
          marginTop: 10,
          gap: 5,
        }}
      >
        {movie.spineCover && (
          <img
            style={{ borderRadius: 5, maxHeight: 450 }}
            src={thumbnailUrl(movie.spineCover._id)}
            alt={`${movie.name} DVD spine`}
          />
        )}
        <img
          style={{ borderRadius: 5, maxHeight: 450 }}
          src={movie.frontCover && thumbnailUrl(movie.frontCover._id)}
          alt={`${movie.name} DVD front cover`}
        />
        {movie.backCover && (
          <img
            style={{ borderRadius: 5, maxHeight: 450 }}
            src={thumbnailUrl(movie.backCover._id)}
            alt={`${movie.name} DVD back cover`}
          />
        )}
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 1000,
          padding: 10,
          gap: 20,
          flexDirection: "column",
        }}
      >
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              {movie.favorite ? (
                <HeartIcon style={{ fontSize: 32, color: "#ff3355" }} />
              ) : (
                <HeartBorderIcon style={{ fontSize: 32 }} />
              )}
            </div>
            <div>
              {movie.bookmark ? (
                <BookmarkIcon style={{ fontSize: 32 }} />
              ) : (
                <BookmarkBorderIcon style={{ fontSize: 32 }} />
              )}
            </div>
            <div style={{ flexGrow: 1 }} />
            {!!movie.studio && (
              /* TODO: link */
              <img
                style={{ maxWidth: 200, maxHeight: 64, objectFit: "cover" }}
                src={thumbnailUrl(movie.studio.thumbnail?._id)}
                alt={`${movie.studio.name} Logo`}
              />
            )}
          </div>
        </Card>
        <Card>
          <CardTitle>{t("general")}</CardTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
            }}
          >
            <div
              /* TODO: flex col card body component */
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <CardSection title={t("title")}>
                <div style={{ opacity: 0.5 }}>{movie.name}</div>
              </CardSection>
              {!!movie.studio && (
                <CardSection title={t("studio", { numItems: 2 })}>
                  <div style={{ opacity: 0.5 }}>
                    <Link href={`/studio/${movie.studio._id}`}>
                      <a>{movie.studio.name}</a>
                    </Link>
                  </div>
                </CardSection>
              )}
              {movie.releaseDate && (
                <CardSection title={t("releaseDate")}>
                  <div style={{ opacity: 0.5 }}>
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </div>
                </CardSection>
              )}
              {movie.description && (
                <CardSection title={t("description")}>
                  <p
                    style={{
                      textAlign: "justify",
                      opacity: 0.5,
                      margin: 0,
                      lineHeight: "150%",
                      overflow: "hidden",
                    }}
                  >
                    {movie.description}
                  </p>
                </CardSection>
              )}
              <CardSection title={t("rating")}>
                <Rating readonly value={movie.rating}></Rating>
              </CardSection>
              <CardSection title={t("labels", { numItems: 2 })}>
                <LabelGroup limit={999} labels={movie.labels} />
              </CardSection>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <CardSection title={t("videoDuration")}>
                <div style={{ opacity: 0.5 }}>{formatDuration(movie.duration)}</div>
              </CardSection>
              <CardSection title={t("fileSize")}>
                <div title={`${movie.size} bytes`} style={{ opacity: 0.5 }}>
                  {prettyBytes(movie.size)}
                </div>
              </CardSection>
            </div>
          </div>
        </Card>
        <CardTitle>
          <span>
            {movie.scenes.length} {t("scene", { numItems: movie.scenes.length })}
          </span>
        </CardTitle>
        <ListWrapper loading={false} noResults={!movie.scenes.length}>
          {movie.scenes.map((scene) => (
            <SceneCard key={scene._id} scene={scene}></SceneCard>
          ))}
        </ListWrapper>
        <CardTitle>
          <span>
            {movie.actors.length} {t("actor", { numItems: movie.actors.length })}
          </span>
        </CardTitle>
        <ListWrapper loading={false} noResults={!movie.actors.length}>
          {movie.actors.map((actor) => (
            <ActorCard key={actor._id} actor={actor}></ActorCard>
          ))}
        </ListWrapper>
      </div>
    </>
  );
}
