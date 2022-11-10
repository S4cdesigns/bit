import Color from "color";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useTranslations } from "next-intl";
import { useContext, useMemo, useState } from "react";

import { SafeModeContext } from "../pages/_app";
import { IMovie } from "../types/movie";
import { bookmarkMovie, favoriteMovie } from "../util/mutations/movie";
import { formatDuration } from "../util/string";
import { thumbnailUrl } from "../util/thumbnail";
import ActorList from "./ActorList";
import LabelGroup from "./LabelGroup";
import Paper from "./Paper";
import Rating from "./Rating";
import ResponsiveImage from "./ResponsiveImage";

type Props = {
  movie: IMovie;
  onFav: (value: boolean) => void;
  onBookmark: (value: Date | null) => void;
};

export default function MovieCard({ movie, onFav, onBookmark }: Props) {
  const { enabled: safeMode } = useContext(SafeModeContext);
  const t = useTranslations();
  const [hover, setHover] = useState(false);

  const thumbSrc = useMemo(() => {
    if (hover && movie.backCover) {
      return movie.backCover && thumbnailUrl(movie.backCover._id);
    }
    return movie.frontCover && thumbnailUrl(movie.frontCover._id);
  }, [hover]);

  async function toggleFav(): Promise<void> {
    const newValue = !movie.favorite;
    await favoriteMovie(movie._id, newValue);
    onFav(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = movie.bookmark ? null : new Date();
    await bookmarkMovie(movie._id, newValue);
    onBookmark(newValue);
  }

  const titleColor = (() => {
    if (!movie.frontCover?.color) {
      return undefined;
    }
    let color = new Color(movie.frontCover.color);
    color = color.hsl(color.hue(), 100, 85);
    return color.hex();
  })();

  return (
    <Paper style={{ position: "relative" }}>
      <div onMouseLeave={() => setHover(false)} onMouseEnter={() => setHover(true)}>
        <ResponsiveImage
          aspectRatio="0.71"
          href={`/movie/${movie._id}`}
          src={thumbSrc}
          imgStyle={{
            transition: "filter 0.15s ease-in-out",
            filter: safeMode ? "blur(20px)" : undefined,
            display: "block",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 2,
              fontSize: 14,
              color: "white",
              position: "absolute",
              right: 1,
              bottom: 1,
            }}
          >
            <div style={{ borderRadius: 4, padding: "2px 5px", background: "#000000dd" }}>
              <b>{movie.scenes.length}</b> {t("scene", { numItems: movie.scenes.length })}
            </div>
            {movie.duration && (
              <div style={{ borderRadius: 4, padding: "2px 5px", background: "#000000dd" }}>
                <b>{formatDuration(movie.duration)}</b>
              </div>
            )}
          </div>
        </ResponsiveImage>
      </div>
      <div
        style={{
          color: "white",
          display: "flex",
          alignItems: "center",
          background: "#000000bb",
          borderRadius: 5,
          padding: 3,
          position: "absolute",
          left: 1,
          top: 1,
        }}
      >
        <div className="hover">
          {movie.favorite ? (
            <HeartIcon
              className="hover"
              onClick={toggleFav}
              style={{ fontSize: 28, color: "#ff3355" }}
            />
          ) : (
            <HeartBorderIcon className="hover" onClick={toggleFav} style={{ fontSize: 28 }} />
          )}
        </div>
        <div className="hover">
          {movie.bookmark ? (
            <BookmarkIcon className="hover" onClick={toggleBookmark} style={{ fontSize: 28 }} />
          ) : (
            <BookmarkBorderIcon
              className="hover"
              onClick={toggleBookmark}
              style={{ fontSize: 28 }}
            />
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "6px 8px 8px 8px" }}>
        <div style={{ display: "flex" }}>
          {movie.studio && (
            <div style={{ textTransform: "uppercase", fontSize: 12, opacity: 0.8 }}>
              {movie.studio.name}
            </div>
          )}
          <div style={{ flexGrow: 1 }}></div>
          {movie.releaseDate && (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {new Date(movie.releaseDate).toLocaleDateString()}
            </div>
          )}
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              color: titleColor,
            }}
          >
            {movie.name}
          </div>
        </div>

        {!!movie.actors.length && <ActorList actors={movie.actors} />}

        <div>
          <Rating value={movie.rating || 0} readonly />
        </div>

        <div>
          <LabelGroup labels={movie.labels} />
        </div>
      </div>
    </Paper>
  );
}
