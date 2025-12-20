import { Img } from '@/components/Img';
import { AirSwitch } from '@/sidepanel/AirSwitch';
import { MoveItem } from '@/sidepanel/MoveItem';
import { nameMap, useStore } from '@/store';
import { Reorder } from 'motion/react';

export const Settings = () => {
  const { state, setHistory } = useStore();
  const {
    popList,
    popMap,
    popLarge,
    popDark,
    popText,
    popUppercase,
    authData,
  } = state;

  const isAuthed = Boolean(authData && !authData.error);

  return (
    <>
      <h2>Display</h2>
      <Reorder.Group
        as="div"
        className="section"
        axis="y"
        values={popList}
        onReorder={(newList) => {
          if (isAuthed) {
            setHistory({ popList: newList });
          }
        }}
      >
        {popList.map((type) => {
          const show = popMap[type];
          const text = nameMap[type];

          return (
            <MoveItem key={type} value={type} disabled={!isAuthed}>
              <AirSwitch
                className="pl-(--drag-w)"
                checked={show}
                onChange={(val) => {
                  if (isAuthed) {
                    setHistory({ popMap: { ...popMap, [type]: val } });
                  }
                }}
                text={
                  <div className="flex items-center gap-[6px]">
                    <Img
                      className="size-[14px] opacity-40"
                      src={`/${type}.svg`}
                    />
                    {text}
                  </div>
                }
              />
            </MoveItem>
          );
        })}
      </Reorder.Group>

      <h2>Style</h2>
      <div className="section">
        <AirSwitch
          checked={popLarge}
          onChange={(val) => {
            if (isAuthed) {
              setHistory({ popLarge: val });
            }
          }}
          text="Large Mode"
        />
        <AirSwitch
          checked={popDark}
          onChange={(val) => {
            if (isAuthed) {
              setHistory({ popDark: val });
            }
          }}
          text="Dark Mode"
        />
      </div>

      <div className="section mt-[6px]">
        <AirSwitch
          checked={popText}
          onChange={(val) => {
            if (isAuthed) {
              setHistory({ popText: val });
            }
          }}
          text="Text Mode"
        />
        {popText && (
          <AirSwitch
            checked={popUppercase}
            onChange={(val) => {
              if (isAuthed) {
                setHistory({ popUppercase: val });
              }
            }}
            text="Uppercase"
          />
        )}
      </div>
    </>
  );
};
