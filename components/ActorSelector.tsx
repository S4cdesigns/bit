import { useContext } from "react";

import { ThemeContext } from "../pages/_app";
import { IActor } from "../types/actor";
import { thumbnailUrl } from "../util/thumbnail";
import styles from "./actor_details/ActorProfile.module.scss";
import Paper from "./Paper";

type Props = {
  items: IActor[];
  selected: string[];
  onChange?: (x: string[]) => void;
};

export default function ActorSelector({ items, selected, onChange }: Props) {
  const { theme } = useContext(ThemeContext);

  function isSelected(actorId: string): boolean {
    return selected.includes(actorId);
  }

  return (
    <>
      {items.map((actor) => (
        <Paper
          onClick={() => {
            if (isSelected(actor._id)) {
              onChange?.(selected.filter((y) => y !== actor._id));
            } else {
              onChange?.([...selected, actor._id]);
            }
          }}
          className="hover"
          key={actor._id}
          style={{
            border: "none",
            padding: "5px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: isSelected(actor._id)
              ? theme === "dark"
                ? "#303350"
                : "#ccddff"
              : theme === "dark"
              ? "#1C1C25"
              : "white",
          }}
        >
          {/* <img
            style={{ borderRadius: "45%", objectFit: "cover" }}
            width="40"
            height="40"
            src={thumbnailUrl(actor.avatar?._id)}
            alt={actor.name}
          /> */}
          {actor.avatar ? (
            <img
              style={{
                borderColor: "#aaaaaaaa",
                borderRadius: "40%",
                borderWidth: 1,
                borderStyle: "solid",
                objectFit: "cover",
                position: "relative",
              }}
              width="36"
              src={thumbnailUrl(actor.avatar._id)}
            />
          ) : (
            <div
              style={{
                borderColor: "#aaaaaaaa",
                borderRadius: "40%",
                borderWidth: 1,
                borderStyle: "solid",
                objectFit: "cover",
                width: 36,
                height: 36,
                aspectRatio: "1",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  opacity: 0.1,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  position: "absolute",
                }}
              >
                ?
              </span>
            </div>
          )}
          <div style={{ opacity: 0.8, fontSize: 16, fontWeight: 500 }}>{actor.name}</div>
        </Paper>
      ))}
    </>
  );
}
