import FlagIcon from "mdi-react/FlagIcon";
import FlagOutlineIcon from "mdi-react/FlagOutlineIcon";
import EditIcon from "mdi-react/PencilIcon";
import moment from "moment";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import Select from "react-select/dist/declarations/src/Select";

import { useSelectStyle } from "../composables/use_select_style";
import { useWindow } from "../composables/use_window";
import { IActor } from "../types/actor";
import { graphqlQuery } from "../util/gql";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import CountryDropdownChoice from "./CountryDropdownChoice";
import { CountrySelector } from "./CountrySelector";
import ExternalLinksEditor from "./ExternalLinksEditor";
import IconButtonMenu from "./IconButtonMenu";
import LabelDropdownChoice, { SelectableLabel } from "./LabelDropdownChoice";
import Subheading from "./Subheading";
import Window from "./Window";

export const convertTimestampToDate = (timestamp?: number) => {
  if (!timestamp) {
    return;
  }

  return moment(timestamp).format("YYYY-MM-DD");
};

async function editActor(
  id: string,
  name: string,
  aliases: string[],
  externalLinks: { url: string; text: string }[],
  labels: String[],
  nationality?: string
) {
  const query = `
  mutation ($ids: [String!]!, $opts: ActorUpdateOpts!) {
    updateActors(ids: $ids, opts: $opts) {
      _id
    }
  }
 `;

  await graphqlQuery(query, {
    ids: [id],
    opts: { name, aliases, externalLinks, labels, nationality },
  });
}

type Props = {
  onEdit: () => void;
  actor: IActor;
};

export default function ActorEditor({ onEdit, actor }: Props) {
  const t = useTranslations();
  const selectStyle = useSelectStyle();

  const { isOpen, close, open } = useWindow();
  const [name, setName] = useState(actor.name);
  const [bornOn, setBornOn] = useState(actor.bornOn);
  const [nationality, setNationality] = useState(actor.nationality);
  const [aliasInput, setAliasInput] = useState(
    actor.aliases.map((alias) => ({ value: alias, label: alias }))
  );

  const [selectedLabels, setSelectedLabels] = useState<readonly SelectableLabel[]>(
    actor.labels || []
  );
  const [externalLinks, setExternalLinks] = useState(actor.externalLinks);
  const [loading, setLoader] = useState(false);

  return (
    <>
      <EditIcon onClick={open} className="hover" />
      <Window
        onClose={close}
        isOpen={isOpen}
        title={t("actions.edit")}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  setLoader(true);
                  await editActor(
                    actor._id,
                    name,
                    aliasInput.map((alias) => alias.value),
                    externalLinks,
                    selectedLabels.map((label) => label._id),
                    nationality?.alpha2
                  );
                  onEdit();
                  close();
                  // setName("");
                  // setAliasInput([]);
                  // setSelectedLabels([]);
                } catch (error) {}
                setLoader(false);
              }}
              style={{ color: "white", background: "#3142da" }}
            >
              Edit
            </Button>
            <Button onClick={close}>Close</Button>
          </>
        }
      >
        <div>
          <Subheading>Actor name</Subheading>
          <input
            style={{ width: "100%" }}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Enter an actor name"
            type="text"
          />
        </div>
        <div>
          <AutoLayout layout="h">
            <div style={{ flex: 1 }}>
              <Subheading>Born on</Subheading>
              <input
                style={{ height: 38, padding: 18, borderRadius: 5, width: "100%" }}
                type="date"
                value={convertTimestampToDate(bornOn)}
                onChange={(e) => setBornOn(new Date(e.currentTarget.value).getTime())}
              ></input>
            </div>
            <div style={{ flex: 1 }}>
              <Subheading>Nationality</Subheading>
              <CountryDropdownChoice
                selected={nationality}
                onChange={(country) => setNationality(country)}
              />
            </div>
          </AutoLayout>
        </div>
        <div>
          <Subheading>Aliases</Subheading>
          <CreatableSelect
            styles={selectStyle}
            isMulti
            value={aliasInput}
            onChange={(options: MultiValue<{ value: string; label: string }>) => {
              setAliasInput(
                options.map((option) => ({ value: option.value, label: option.label }))
              );
            }}
          />
        </div>
        <div>
          <Subheading>Labels</Subheading>
          <LabelDropdownChoice selectedLabels={selectedLabels} onChange={setSelectedLabels} />
        </div>
        <ExternalLinksEditor value={externalLinks} onChange={setExternalLinks} />
      </Window>
    </>
  );
}
