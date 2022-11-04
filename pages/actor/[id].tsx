import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import ActorProfile from "../../components/actor_details/ActorProfile";
import ActorStats from "../../components/actor_details/ActorStats";
import HeroImage from "../../components/actor_details/HeroImage";
import SceneList from "../../components/actor_details/SceneList";
import Card from "../../components/Card";
import CardSection from "../../components/CardSection";
import CardTitle from "../../components/CardTitle";
import ComplexGrid from "../../components/ComplexGrid";
import Description from "../../components/Description";
import LabelGroup from "../../components/LabelGroup";
import ListContainer from "../../components/ListContainer";
import { actorCardFragment } from "../../fragments/actor";
import { IActor } from "../../types/actor";
import { buildQueryParser } from "../../util/query_parser";
import PageWrapper from "../../components/PageWrapper";

const queryParser = buildQueryParser({
  q: {
    default: "",
  },
  page: {
    default: 0,
  },
  // TODO:
  /*  sortBy: {
    default: "addedOn",
  },
  sortDir: {
    default: "desc",
  }, */
  favorite: {
    default: false,
  },
  bookmark: {
    default: false,
  },
  rating: {
    default: 0,
  },
  actors: {
    default: [] as string[],
  },
  labels: {
    default: [] as string[],
  },
  activeTab: {
    default: "scenes",
  },
});

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { data } = await axios.post<{
    data: {
      getActorById: IActor;
    };
  }>(
    "http://localhost:3000/api/ql",
    {
      query: `
      query ($id: String!) {
        getActorById(id: $id) {
          ...ActorCard
          bornOn
          aliases
          averageRating
          score
          numScenes
          labels {
            _id
            name
            color
          }
          thumbnail {
            _id
            color
          }
          altThumbnail {
            _id
          }
          watches
          hero {
            _id
            color
          }
          avatar {
            _id
            color
          }
          resolvedCustomFields {
            field {
              _id
              name
              type
              unit
            }
            value
          }
        }
      }
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
      actor: data.data.getActorById,
    },
  };
};

export default function ActorPage({ actor }: { actor: IActor }) {
  const t = useTranslations();
  const router = useRouter();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const leftCol = (
    <div>
      <Card style={{ padding: "20px 10px" }}>
        <ActorProfile
          actorId={actor._id}
          actorName={actor.name}
          age={actor.age}
          bornOn={actor.bornOn}
          avatarId={actor.avatar?._id}
          nationality={actor.nationality}
          rating={actor.rating}
          favorite={actor.favorite}
          bookmark={actor.bookmark}
        />
      </Card>
    </div>
  );

  const rightCol = (
    <div style={{ display: "flex", gap: 20, flexDirection: "column" }}>
      <Card>
        <div style={{ fontSize: 20 }}>{t("stats")}</div>
        <ActorStats
          numScenes={actor.numScenes}
          numWatches={actor.watches.length}
          averageRating={actor.averageRating}
          score={actor.score}
        />
      </Card>
      <Card>
        <CardTitle>{t("general")}</CardTitle>
        {!!actor.aliases.length && (
          <CardSection title={t("aliases")}>
            <div style={{ opacity: 0.5 }}>
              {actor.aliases.filter((x) => !x.startsWith("regex:")).join(", ")}
            </div>
          </CardSection>
        )}
        {actor.description && (
          <CardSection title={t("description")}>
            <Description>{actor.description}</Description>
          </CardSection>
        )}
        <CardSection title={t("labels", { numItems: 2 })}>
          <LabelGroup limit={999} labels={actor.labels} />
        </CardSection>
        <CardSection title={t("customData")}>
          {
            <ListContainer gap={15} size={200}>
              {actor.resolvedCustomFields.map(({ field, value }) => (
                <div key={field._id} style={{ overflow: "hidden" }}>
                  <div style={{ opacity: 0.8, marginBottom: 5 }}>{field.name}</div>
                  <div style={{ opacity: 0.5, fontSize: 15 }}>
                    {field.type === "MULTI_SELECT" && (
                      <div>
                        {(value as string[]).join(", ")} {field.unit}
                      </div>
                    )}
                    {field.type === "SINGLE_SELECT" && (
                      <div>
                        {value} {field.unit}
                      </div>
                    )}
                    {field.type === "BOOLEAN" && <div>{value ? "Yes" : "No"}</div>}
                    {field.type === "STRING" && (
                      <div>
                        {value} {field.unit}
                      </div>
                    )}
                    {field.type === "NUMBER" && (
                      <div>
                        {value} {field.unit}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </ListContainer>
          }
        </CardSection>
      </Card>
      {parsedQuery.activeTab === "scenes" && (
        <SceneList
          writeQuery={(qs) => {
            queryParser.store(router, {
              ...qs,
              activeTab: "scenes",
            });
          }}
          actorId={actor._id}
          initialState={parsedQuery}
        />
      )}
    </div>
  );

  return (
    <PageWrapper title={actor.name}>
      <HeroImage imageId={actor.hero?._id} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ComplexGrid negativeTop={!!actor.hero} leftChildren={leftCol} rightChildren={rightCol} />
      </div>
    </PageWrapper>
  );
}
