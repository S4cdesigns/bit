import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useMemo, useState } from "react";

import { IActor } from "../types/actor";
import { thumbnailUrl } from "../util/thumbnail";
import Flag from "./Flag";
import LabelGroup from "./LabelGroup";
import Paper from "./Paper";
import Rating from "./Rating";
import ResponsiveImage from "./ResponsiveImage";

export default function ActorCard({ actor }: { actor: IActor }) {
  const [hover, setHover] = useState(false);

  const thumbSrc = useMemo(() => {
    if (hover && actor.altThumbnail) {
      return actor.altThumbnail && thumbnailUrl(actor.altThumbnail._id);
    }
    return actor.thumbnail && thumbnailUrl(actor.thumbnail._id);
  }, [hover]);

  return (
    <Paper style={{ position: "relative" }}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <ResponsiveImage aspectRatio="3 / 4" href={`/actor/${actor._id}`} src={thumbSrc} />
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
          {actor.favorite ? (
            <HeartIcon style={{ fontSize: 28, color: "#ff3355" }} />
          ) : (
            <HeartBorderIcon style={{ fontSize: 28 }} />
          )}
        </div>
        <div className="hover">
          {actor.bookmark ? (
            <BookmarkIcon style={{ fontSize: 28 }} />
          ) : (
            <BookmarkBorderIcon style={{ fontSize: 28 }} />
          )}
        </div>
      </div>
      <div style={{ margin: "4px 8px 8px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: 16,
            gap: 5,
          }}
        >
          {actor.nationality && (
            <Flag
              name={actor.nationality.alias || actor.nationality.name}
              size={20}
              code={actor.nationality.alpha2}
            />
          )}
          <div
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {actor.name}
          </div>
          <div style={{ flexGrow: 1 }}></div>
          <div>{actor.age}</div>
        </div>

        <div style={{ marginTop: 5 }}>
          <Rating value={actor.rating || 0} readonly />
        </div>

        <div style={{ marginTop: 5 }}>
          <LabelGroup labels={actor.labels} />
        </div>
      </div>
    </Paper>
  );
}
