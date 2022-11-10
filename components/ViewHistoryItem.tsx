import Link from "next/link";
import { useContext } from "react";
import { SafeModeContext } from "../pages/_app";
import { thumbnailUrl } from "../util/thumbnail";
import ActorList from "./ActorList";
import LabelGroup from "./LabelGroup";
import ResponsiveImage from "./ResponsiveImage";

type Props = {
  date: Date;
  scene: {
    _id: string;
    name: string;
    thumbnail?: {
      _id: string;
      color?: string;
    };
    actors: {
      _id: string;
      name: string;
    }[];
    labels: {
      _id: string;
      name: string;
      color?: string;
    }[];
    studio?: {
      _id: string;
      name: string;
    };
  };
};

export default function ViewHistoryItem({ date, scene }: Props) {
  const { enabled: safeMode } = useContext(SafeModeContext);

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <ResponsiveImage
          aspectRatio="4 / 3"
          href={`/scene/${scene._id}`}
          src={scene.thumbnail?._id && thumbnailUrl(scene.thumbnail._id)}
          imgStyle={{
            transition: "filter 0.15s ease-in-out",
            filter: safeMode ? "blur(20px)" : undefined,
            height: "160px",
          }}
          containerStyle={{
            borderRadius: 12,
            overflow: "hidden",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "6px 8px 8px 8px" }}>
        <div style={{ display: "flex" }}>
          {scene.studio && (
            <Link href={`/studio/${scene.studio._id}`} passHref>
              <a>
                <div style={{ textTransform: "uppercase", fontSize: 12, opacity: 0.8 }}>
                  {scene.studio.name}
                </div>
              </a>
            </Link>
          )}
        </div>
        <div
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            //color: titleColor,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {scene.name}
        </div>

        {!!scene.actors.length && <ActorList actors={scene.actors} />}

        <div
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            fontSize: 13,
            opacity: 0.66,
          }}
        >
          Watched {date.toLocaleString()}
        </div>

        {/* <div style={{ marginTop: 5 }}>
      <Rating onChange={changeRating} value={scene.rating || 0} />
    </div> */}

        <div style={{ marginTop: 5 }}>
          <LabelGroup labels={scene.labels} />
        </div>
      </div>
    </div>
  );
}
