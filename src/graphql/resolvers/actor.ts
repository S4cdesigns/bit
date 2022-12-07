import { ICountry } from "../../data/countries";
import { IzzyContext } from "../../middlewares/apollo";
import Actor from "../../types/actor";
import { getNationality } from "../../types/countries";
import CustomField, { CustomFieldTarget } from "../../types/custom_field";
import Image from "../../types/image";
import Label from "../../types/label";
import Scene from "../../types/scene";
import { createObjectSet } from "../../utils/misc";

export default {
  async percentWatched(actor: Actor): Promise<number> {
    const numScenes = (await Scene.getByActor(actor._id)).length;
    if (!numScenes) {
      return 0;
    }

    const uniqueViews = await Actor.countUniqueViews(actor);
    return uniqueViews / numScenes;
  },
  async score(actor: Actor): Promise<number> {
    const avgRating = await Actor.getAverageRating(actor);
    const numViews = await Actor.countUniqueViews(actor);
    return Actor.calculateScore(actor, numViews, avgRating);
  },
  async averageRating(actor: Actor): Promise<number> {
    return await Actor.getAverageRating(actor);
  },
  async labels(actor: Actor): Promise<Label[]> {
    const labels = await Actor.getLabels(actor);
    return labels.sort((a, b) => a.name.localeCompare(b.name));
  },
  async avatar(actor: Actor): Promise<Image | null> {
    if (actor.avatar) {
      return await Image.getById(actor.avatar);
    }
    return null;
  },
  async thumbnail(actor: Actor): Promise<Image | null> {
    if (actor.thumbnail) {
      return await Image.getById(actor.thumbnail);
    }
    return null;
  },
  async altThumbnail(actor: Actor): Promise<Image | null> {
    if (actor.altThumbnail) {
      return await Image.getById(actor.altThumbnail);
    }
    return null;
  },
  async hero(actor: Actor): Promise<Image | null> {
    if (actor.hero) {
      return await Image.getById(actor.hero);
    }
    return null;
  },
  async watches(actor: Actor): Promise<number[]> {
    const watches = await Actor.getWatches(actor);
    return watches.map((w) => w.date);
  },
  async numScenes(actor: Actor): Promise<number> {
    return (await Scene.getByActor(actor._id)).length;
  },
  async resolvedCustomFields(actor: Actor): Promise<{ field: CustomField; value: any }[]> {
    const fields = await CustomField.getAll();
    return Object.entries(actor.customFields).reduce((arr, [key, value]) => {
      arr.push({
        field: fields.find((f) => f._id === key)!,
        value,
      });
      return arr;
    }, [] as { field: CustomField; value: any }[]);
  },
  async availableFields(): Promise<CustomField[]> {
    const fields = await CustomField.getAll();
    return fields.filter((field) => field.target.includes(CustomFieldTarget.ACTORS));
  },
  age(actor: Actor): number | null {
    return Actor.getAge(actor);
  },
  async collabs(actor: Actor, _: any, context: IzzyContext): Promise<Actor[]> {
    const collabs = await Actor.getCollabs(actor);
    const actors = collabs.map((c) => c.actors).flat();
    const set = createObjectSet(actors, "_id");
    return set.sort((a, b) => a.name.localeCompare(b.name));
  },
  nationality(actor: Actor): ICountry | null {
    if (!actor.nationality) {
      return null;
    }
    return getNationality(actor.nationality);
  },
  externalLinks(actor: Actor): { url: string; text: string }[] {
    return actor.externalLinks || [];
  },
};
